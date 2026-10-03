import { describe, expect, it } from 'vitest';
import {
  AUTOFILL_MESSAGES,
  PREFECTURES,
  formatPostalCode,
  isPrefecture,
  normalizePostalCode,
  parseZipcloudResponse,
  planAutofill,
  shouldReplaceStreet,
} from './address';

/** zipcloud の実際の応答（910-0005）と同じ形。 */
const fukuiOte = {
  message: null,
  results: [
    {
      address1: '福井県',
      address2: '福井市',
      address3: '大手',
      kana1: 'ﾌｸｲｹﾝ',
      kana2: 'ﾌｸｲｼ',
      kana3: 'ｵｵﾃ',
      prefcode: '18',
      zipcode: '9100005',
    },
  ],
  status: 200,
};

describe('PREFECTURES', () => {
  it('47 都道府県が北海道から沖縄県の順に重複なく並ぶ', () => {
    expect(PREFECTURES).toHaveLength(47);
    expect(new Set(PREFECTURES).size).toBe(47);
    expect(PREFECTURES[0]).toBe('北海道');
    expect(PREFECTURES[17]).toBe('福井県');
    expect(PREFECTURES[46]).toBe('沖縄県');
    expect(isPrefecture('福井県')).toBe(true);
    expect(isPrefecture('福井')).toBe(false);
    expect(isPrefecture('')).toBe(false);
  });
});

describe('normalizePostalCode（FR-4.7）', () => {
  it('ハイフンあり・なしの 7 桁を半角 7 桁にそろえる', () => {
    expect(normalizePostalCode('910-0005')).toBe('9100005');
    expect(normalizePostalCode('9100005')).toBe('9100005');
    expect(normalizePostalCode(' 〒910 0005 ')).toBe('9100005');
  });

  it('全角数字と全角ハイフンも受け付ける', () => {
    expect(normalizePostalCode('９１０－０００５')).toBe('9100005');
    expect(normalizePostalCode('９１０ー０００５')).toBe('9100005');
  });

  it('6 桁・8 桁・数字以外は null（境界）', () => {
    expect(normalizePostalCode('910-000')).toBeNull();
    expect(normalizePostalCode('123-456')).toBeNull();
    expect(normalizePostalCode('910-00051')).toBeNull();
    expect(normalizePostalCode('91O-0005')).toBeNull();
    expect(normalizePostalCode('')).toBeNull();
  });

  it('formatPostalCode は 7 桁を 123-4567 の形にする', () => {
    expect(formatPostalCode('9100005')).toBe('910-0005');
    expect(formatPostalCode('91000')).toBe('91000');
  });
});

describe('parseZipcloudResponse（FR-4.7）', () => {
  it('候補が 1 件なら都道府県・市区町村・町名を取り出す（正常系）', () => {
    expect(parseZipcloudResponse(fukuiOte)).toEqual({
      kind: 'found',
      candidates: [{ prefecture: '福井県', city: '福井市', town: '大手' }],
    });
  });

  it('results: null は該当なし（notFound）', () => {
    expect(parseZipcloudResponse({ message: null, results: null, status: 200 })).toEqual({
      kind: 'notFound',
    });
  });

  it('候補が複数あればすべて返す（境界）', () => {
    const result = parseZipcloudResponse({
      message: null,
      status: 200,
      results: [
        { address1: '北海道', address2: '美唄市', address3: '上美唄町協和' },
        { address1: '北海道', address2: '美唄市', address3: '上美唄町南' },
        { address1: '北海道', address2: '美唄市', address3: '上美唄町' },
      ],
    });
    expect(result.kind).toBe('found');
    if (result.kind !== 'found') return;
    expect(result.candidates).toHaveLength(3);
    expect(result.candidates.map((c) => c.town)).toEqual([
      '上美唄町協和',
      '上美唄町南',
      '上美唄町',
    ]);
  });

  it('status 400 は zipcloud の message をそのまま返す（エラー）', () => {
    expect(
      parseZipcloudResponse({
        message: 'パラメータ「郵便番号」の桁数が不正です。',
        results: null,
        status: 400,
      }),
    ).toEqual({ kind: 'error', message: 'パラメータ「郵便番号」の桁数が不正です。' });
    const serverError = parseZipcloudResponse({ message: null, results: null, status: 500 });
    expect(serverError.kind).toBe('error');
  });

  it('想定外の形は例外を投げずに error を返す（エラー）', () => {
    expect(parseZipcloudResponse(null).kind).toBe('error');
    expect(parseZipcloudResponse('not json').kind).toBe('error');
    expect(parseZipcloudResponse([]).kind).toBe('error');
    expect(parseZipcloudResponse({ results: [] }).kind).toBe('error');
    expect(parseZipcloudResponse({ status: 200, results: 'x' }).kind).toBe('error');
    expect(
      parseZipcloudResponse({ status: 200, results: [{ address1: '福井県', address2: 1 }] }).kind,
    ).toBe('error');
  });

  it('47 都道府県にない候補は除き、残らなければ notFound（境界）', () => {
    const mixed = parseZipcloudResponse({
      status: 200,
      results: [
        { address1: '架空県', address2: '架空市', address3: '' },
        { address1: '福井県', address2: '福井市', address3: '大手' },
      ],
    });
    expect(mixed).toEqual({
      kind: 'found',
      candidates: [{ prefecture: '福井県', city: '福井市', town: '大手' }],
    });
    expect(
      parseZipcloudResponse({
        status: 200,
        results: [{ address1: '架空県', address2: '架空市', address3: '' }],
      }),
    ).toEqual({ kind: 'notFound' });
  });
});

describe('planAutofill / shouldReplaceStreet（FR-4.7）', () => {
  it('候補が 1 件なら町名まで入れる（正常系）', () => {
    expect(planAutofill([{ prefecture: '福井県', city: '福井市', town: '大手' }])).toEqual({
      prefecture: '福井県',
      city: '福井市',
      town: '大手',
      outcome: 'filled',
    });
  });

  it('町名が候補ごとに違えば町名は入れず、都道府県と市区町村は先頭から入れる', () => {
    const plan = planAutofill([
      { prefecture: '北海道', city: '美唄市', town: '上美唄町協和' },
      { prefecture: '北海道', city: '美唄市', town: '上美唄町南' },
    ]);
    expect(plan).toEqual({ prefecture: '北海道', city: '美唄市', town: null, outcome: 'multiple' });
    expect(AUTOFILL_MESSAGES[plan?.outcome ?? 'idle']).toBe(
      '候補が複数あります。町名・番地を入力してください',
    );
  });

  it('候補が複数でも町名がすべて同じなら町名を入れる。候補が空なら null（境界）', () => {
    const same = { prefecture: '福井県', city: '福井市', town: '大手' } as const;
    expect(planAutofill([same, same])?.outcome).toBe('filled');
    expect(planAutofill([])).toBeNull();
  });

  it('町名・番地は空か前回の自動入力のままのときだけ上書きする', () => {
    expect(shouldReplaceStreet('', null)).toBe(true);
    expect(shouldReplaceStreet('  ', '大手')).toBe(true);
    expect(shouldReplaceStreet('大手', '大手')).toBe(true);
    expect(shouldReplaceStreet('大手3-17-1', '大手')).toBe(false);
    expect(shouldReplaceStreet('大手', null)).toBe(false);
  });
});
