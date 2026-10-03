import { describe, expect, it } from 'vitest';
import {
  EMPTY_SHIPPING_FORM,
  ERROR_MESSAGES,
  applyAutofill,
  firstErrorField,
  formatShippingAddress,
  hasErrors,
  normalizeDigits,
  validateShipping,
  type ShippingForm,
} from './checkout';
import { ORDER_NUMBER_PATTERN, generateOrderNumber } from './order';

const valid: ShippingForm = {
  name: '田中 健太',
  postalCode: '910-0005',
  prefecture: '福井県',
  city: '福井市',
  street: '大手3-17-1',
  building: '',
  phone: '090-1234-5678',
  email: 'kenta@example.com',
};

describe('validateShipping（US-7 / FR-4.2）', () => {
  it('すべて正しく入力されていればエラーはない', () => {
    const errors = validateShipping(valid);
    expect(errors).toEqual({});
    expect(hasErrors(errors)).toBe(false);
  });

  it('ハイフンや全角数字は無視して判定する（123-4567、固定電話 10 桁）', () => {
    expect(validateShipping({ ...valid, postalCode: '１２３－４５６７' })).toEqual({});
    expect(validateShipping({ ...valid, phone: '0776-12-3456' })).toEqual({});
    expect(normalizeDigits('090ー1234ー5678')).toBe('09012345678');
  });

  it('氏名が空（空白だけを含む）なら氏名にエラー（エラー）', () => {
    const errors = validateShipping({ ...valid, name: '   ' });
    expect(errors).toEqual({ name: ERROR_MESSAGES.name });
    expect(errors.name).toBe('氏名を入力してください');
  });

  it('郵便番号「123-456」（6 桁）は形式エラー（境界）', () => {
    const errors = validateShipping({ ...valid, postalCode: '123-456' });
    expect(errors.postalCode).toBe('郵便番号は 7 桁の数字で入力してください');
  });

  it('電話番号は 10〜11 桁だけ。9 桁と 12 桁はエラー（境界）', () => {
    expect(validateShipping({ ...valid, phone: '090123456' }).phone).toBe(ERROR_MESSAGES.phone);
    expect(validateShipping({ ...valid, phone: '090123456789' }).phone).toBe(ERROR_MESSAGES.phone);
    expect(validateShipping({ ...valid, phone: '0901234567' }).phone).toBeUndefined();
  });

  it('メールアドレスの形式でなければエラー（エラー）', () => {
    expect(validateShipping({ ...valid, email: 'kenta.example.com' }).email).toBe(
      'メールアドレスの形式で入力してください',
    );
    expect(validateShipping({ ...valid, email: 'kenta@example' }).email).toBe(ERROR_MESSAGES.email);
  });

  it('住所の必須 3 項目（都道府県・市区町村・町名・番地）が空ならそれぞれエラー（エラー）', () => {
    const errors = validateShipping({ ...valid, prefecture: '', city: ' ', street: '' });
    expect(errors).toEqual({
      prefecture: '都道府県を選択してください',
      city: '市区町村を入力してください',
      street: '町名・番地を入力してください',
    });
    expect(firstErrorField(errors)).toBe('prefecture');
  });

  it('建物名・部屋番号は任意。空でも入っていてもエラーにならない（境界）', () => {
    expect(validateShipping({ ...valid, building: '' })).toEqual({});
    expect(validateShipping({ ...valid, building: 'フクイハイツ 201' })).toEqual({});
  });

  it('47 都道府県にない値は都道府県のエラー（エラー）', () => {
    const tampered = { ...valid, prefecture: '架空県' } as unknown as ShippingForm;
    expect(validateShipping(tampered).prefecture).toBe(ERROR_MESSAGES.prefecture);
  });

  it('全部空なら必須 7 項目すべてにエラーが出て、最初のエラー項目は氏名', () => {
    const errors = validateShipping(EMPTY_SHIPPING_FORM);
    expect(Object.keys(errors)).toHaveLength(7);
    expect(errors.building).toBeUndefined();
    expect(firstErrorField(errors)).toBe('name');
    expect(firstErrorField({ phone: ERROR_MESSAGES.phone, email: ERROR_MESSAGES.email })).toBe(
      'phone',
    );
  });
});

describe('applyAutofill（FR-4.7）', () => {
  const plan = { prefecture: '福井県', city: '福井市', town: '大手', outcome: 'filled' } as const;
  const empty: ShippingForm = { ...EMPTY_SHIPPING_FORM, name: '田中 健太', postalCode: '9100005' };

  it('空の欄に都道府県・市区町村・町名を入れ、ほかの項目は変えない（正常系）', () => {
    expect(applyAutofill(empty, plan, null)).toEqual({
      ...empty,
      prefecture: '福井県',
      city: '福井市',
      street: '大手',
    });
  });

  it('手で入れた町名・番地は上書きしない。前回の自動入力のままなら置き換える', () => {
    const typed = { ...empty, street: '中央1-1-1' };
    expect(applyAutofill(typed, plan, '中央').street).toBe('中央1-1-1');
    const untouched = {
      ...empty,
      prefecture: '北海道' as const,
      city: '美唄市',
      street: '上美唄町',
    };
    expect(applyAutofill(untouched, plan, '上美唄町')).toMatchObject({
      prefecture: '福井県',
      city: '福井市',
      street: '大手',
    });
  });

  it('町名が決まらない（候補が複数）ときは町名・番地を変えない（境界）', () => {
    const multiple = { ...plan, town: null, outcome: 'multiple' } as const;
    expect(applyAutofill(empty, multiple, null).street).toBe('');
  });
});

describe('formatShippingAddress（US-8）', () => {
  it('〒123-4567 都道府県市区町村町名・番地 建物名 の形で表示する', () => {
    expect(
      formatShippingAddress({
        ...valid,
        postalCode: '９１０－０００５',
        building: 'フクイハイツ 201',
      }),
    ).toBe('〒910-0005 福井県福井市大手3-17-1 フクイハイツ 201');
  });

  it('建物名が空なら省く（境界）', () => {
    expect(formatShippingAddress({ ...valid, building: '  ' })).toBe(
      '〒910-0005 福井県福井市大手3-17-1',
    );
  });
});

describe('generateOrderNumber（US-9 / FR-4.5）', () => {
  it('FB-YYYYMMDD-NNNN の形式で、日付は注文日', () => {
    const number = generateOrderNumber(new Date(2026, 9, 3), () => 0.4821);
    expect(number).toBe('FB-20261003-4821');
    expect(number).toMatch(ORDER_NUMBER_PATTERN);
  });

  it('乱数が 0 や 1 に近くても 4 桁に収まる（境界）', () => {
    expect(generateOrderNumber(new Date(2026, 0, 5), () => 0)).toBe('FB-20260105-0000');
    expect(generateOrderNumber(new Date(2026, 11, 31), () => 0.99999)).toBe('FB-20261231-9999');
  });

  it('不正な日付ではエラーを投げる（エラー）', () => {
    expect(() => generateOrderNumber(new Date('invalid'))).toThrow(RangeError);
  });
});
