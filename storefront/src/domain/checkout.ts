/** 配送先の入力内容（ブラウザには保存しない。NFR-2）。 */
export type ShippingForm = {
  name: string;
  postalCode: string;
  address: string;
  phone: string;
  email: string;
};

export type ShippingField = keyof ShippingForm;

export type ShippingErrors = Partial<Record<ShippingField, string>>;

/** 入力欄の並び順（最初のエラー項目にフォーカスを移すときに使う）。 */
export const SHIPPING_FIELDS: readonly ShippingField[] = [
  'name',
  'postalCode',
  'address',
  'phone',
  'email',
];

export const EMPTY_SHIPPING_FORM: ShippingForm = {
  name: '',
  postalCode: '',
  address: '',
  phone: '',
  email: '',
};

/** ダミーの支払い方法（FR-4.3）。カード番号などの入力欄は持たない。 */
export type PaymentMethod = 'card-demo' | 'cod-demo';

export const PAYMENT_METHODS: readonly { value: PaymentMethod; label: string }[] = [
  { value: 'card-demo', label: 'クレジットカード（デモ）' },
  { value: 'cod-demo', label: '代金引換（デモ）' },
];

export const DEFAULT_PAYMENT_METHOD: PaymentMethod = 'card-demo';

export function paymentLabel(method: PaymentMethod): string {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
}

/** エラー文言（interaction-spec.md「Validation」の表のとおり）。 */
export const ERROR_MESSAGES: Record<ShippingField, string> = {
  name: '氏名を入力してください',
  postalCode: '郵便番号は 7 桁の数字で入力してください',
  address: '住所を入力してください',
  phone: '電話番号は 10〜11 桁の数字で入力してください',
  email: 'メールアドレスの形式で入力してください',
};

/**
 * 番号の入力を判定用に整える。全角数字は半角に、ハイフン（全角・長音記号を含む）と空白は取り除く。
 * 例: "１２３－４５６７" → "1234567"
 */
export function normalizeDigits(value: string): string {
  return value.normalize('NFKC').replace(/[\s\-‐‑‒–—―−ー]/g, '');
}

const POSTAL_CODE = /^\d{7}$/;
const PHONE = /^\d{10,11}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 配送先の入力チェック（FR-4.2）。必須チェックと形式チェックをまとめて行い、
 * 項目ごとのエラー文言を返す。エラーがなければ空のオブジェクト。
 */
export function validateShipping(form: ShippingForm): ShippingErrors {
  const errors: ShippingErrors = {};
  if (form.name.trim() === '') errors.name = ERROR_MESSAGES.name;
  if (!POSTAL_CODE.test(normalizeDigits(form.postalCode))) {
    errors.postalCode = ERROR_MESSAGES.postalCode;
  }
  if (form.address.trim() === '') errors.address = ERROR_MESSAGES.address;
  if (!PHONE.test(normalizeDigits(form.phone))) errors.phone = ERROR_MESSAGES.phone;
  if (!EMAIL.test(form.email.trim())) errors.email = ERROR_MESSAGES.email;
  return errors;
}

export function hasErrors(errors: ShippingErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** 最初のエラー項目（画面の並び順）。 */
export function firstErrorField(errors: ShippingErrors): ShippingField | undefined {
  return SHIPPING_FIELDS.find((field) => errors[field] !== undefined);
}
