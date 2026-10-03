import { normalizeDigits } from './digits';

/** 47 都道府県（JIS X 0401 の都道府県コード順）。 */
export const PREFECTURES = [
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
] as const;

export type Prefecture = (typeof PREFECTURES)[number];

export function isPrefecture(value: string): value is Prefecture {
  return (PREFECTURES as readonly string[]).includes(value);
}

/**
 * 郵便番号を 7 桁の半角数字にそろえる。ハイフン・空白・先頭の「〒」を取り除き、全角数字は半角にする。
 * 7 桁にならなければ null。例: "９１０－０００５" → "9100005"、"123-456" → null
 */
export function normalizePostalCode(input: string): string | null {
  const digits = normalizeDigits(input).replace(/^〒/, '');
  return /^\d{7}$/.test(digits) ? digits : null;
}

/** "9100005" → "910-0005"（7 桁でなければそのまま返す）。 */
export function formatPostalCode(zip7: string): string {
  return /^\d{7}$/.test(zip7) ? `${zip7.slice(0, 3)}-${zip7.slice(3)}` : zip7;
}

/** 郵便番号から引いた住所の候補（都道府県・市区町村・町名）。 */
export type AddressCandidate = {
  prefecture: Prefecture;
  city: string;
  town: string;
};

export type AddressLookupResult =
  | { kind: 'found'; candidates: AddressCandidate[] }
  | { kind: 'notFound' }
  | { kind: 'error'; message: string };

const MALFORMED = '郵便番号検索の応答の形式が正しくありません';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * zipcloud（https://zipcloud.ibsnet.co.jp/doc/api）の応答を解釈する。
 * - `status: 200` で `results` が配列 → found（都道府県が 47 都道府県にない候補は除く。残らなければ notFound）
 * - `status: 200` で `results: null` → notFound（該当する郵便番号がない）
 * - `status: 400 / 500` → error（zipcloud の `message` をそのまま返す）
 * - 想定外の形 → error（例外は投げない）
 */
export function parseZipcloudResponse(json: unknown): AddressLookupResult {
  if (!isRecord(json) || typeof json.status !== 'number') {
    return { kind: 'error', message: MALFORMED };
  }
  if (json.status !== 200) {
    const message =
      typeof json.message === 'string' && json.message.trim() !== ''
        ? json.message
        : `郵便番号検索でエラーが起きました（status ${json.status}）`;
    return { kind: 'error', message };
  }
  if (json.results === null || json.results === undefined) return { kind: 'notFound' };
  if (!Array.isArray(json.results)) return { kind: 'error', message: MALFORMED };

  const candidates: AddressCandidate[] = [];
  for (const item of json.results) {
    if (
      !isRecord(item) ||
      typeof item.address1 !== 'string' ||
      typeof item.address2 !== 'string' ||
      typeof item.address3 !== 'string'
    ) {
      return { kind: 'error', message: MALFORMED };
    }
    const prefecture = item.address1.trim();
    if (!isPrefecture(prefecture)) continue;
    candidates.push({ prefecture, city: item.address2.trim(), town: item.address3.trim() });
  }
  return candidates.length > 0 ? { kind: 'found', candidates } : { kind: 'notFound' };
}

/** 自動入力の内容。`town` が null なら町名・番地の欄は変えない（候補ごとに町名が違うとき）。 */
export type AutofillPlan = {
  prefecture: Prefecture;
  city: string;
  town: string | null;
  outcome: 'filled' | 'multiple';
};

/**
 * 候補から自動入力の内容を決める。都道府県と市区町村は先頭の候補から入れる。
 * 町名は、候補が 1 件か、すべての候補で同じときだけ入れる。候補がなければ null。
 */
export function planAutofill(candidates: readonly AddressCandidate[]): AutofillPlan | null {
  const [first] = candidates;
  if (!first) return null;
  const sameTown = candidates.every((candidate) => candidate.town === first.town);
  return {
    prefecture: first.prefecture,
    city: first.city,
    town: sameTown ? first.town : null,
    outcome: sameTown ? 'filled' : 'multiple',
  };
}

/**
 * 町名・番地の欄を自動入力で上書きしてよいか。空のとき、または前回の自動入力の値のまま
 * （利用者がまだ手を入れていない）ときだけ上書きする。
 */
export function shouldReplaceStreet(current: string, previousAutofill: string | null): boolean {
  return current.trim() === '' || (previousAutofill !== null && current === previousAutofill);
}

/** 郵便番号の横に出す自動入力の状態（入力チェックのエラーではなく、「次へ」は止めない）。 */
export type AutofillStatus = 'idle' | 'loading' | 'filled' | 'multiple' | 'notFound' | 'error';

export const AUTOFILL_MESSAGES: Record<AutofillStatus, string> = {
  idle: '',
  loading: '住所を検索中…',
  filled: '住所を自動入力しました。番地を入力してください',
  multiple: '候補が複数あります。町名・番地を入力してください',
  notFound: '該当する住所が見つかりませんでした。手入力してください',
  error: '住所を自動入力できませんでした。手入力してください',
};
