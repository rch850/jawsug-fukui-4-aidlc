import {
  formatPostalCode,
  isPrefecture,
  normalizePostalCode,
  shouldReplaceStreet,
  type AutofillPlan,
  type Prefecture,
} from './address';
import { normalizeDigits } from './digits';

export { normalizeDigits } from './digits';

/**
 * 配送先の入力内容（ブラウザには保存しない。NFR-2）。
 * 住所は日本の一般的な形式の 4 項目（CR-1）。`prefecture` は未選択のとき空文字。
 */
export type ShippingForm = {
  name: string;
  postalCode: string;
  prefecture: Prefecture | '';
  city: string;
  street: string;
  building: string;
  phone: string;
  email: string;
};

export type ShippingField = keyof ShippingForm;

/** 入力チェックの対象（建物名・部屋番号は任意なのでエラーにならない）。 */
export type ValidatedField = Exclude<ShippingField, 'building'>;

export type ShippingErrors = Partial<Record<ShippingField, string>>;

/** 入力欄の並び順（最初のエラー項目にフォーカスを移すときに使う）。 */
export const SHIPPING_FIELDS: readonly ShippingField[] = [
  'name',
  'postalCode',
  'prefecture',
  'city',
  'street',
  'building',
  'phone',
  'email',
];

export const EMPTY_SHIPPING_FORM: ShippingForm = {
  name: '',
  postalCode: '',
  prefecture: '',
  city: '',
  street: '',
  building: '',
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

/** エラー文言（interaction-spec.md「Validation」の表のとおり。住所の 3 項目は CR-1 で追加）。 */
export const ERROR_MESSAGES: Record<ValidatedField, string> = {
  name: '氏名を入力してください',
  postalCode: '郵便番号は 7 桁の数字で入力してください',
  prefecture: '都道府県を選択してください',
  city: '市区町村を入力してください',
  street: '町名・番地を入力してください',
  phone: '電話番号は 10〜11 桁の数字で入力してください',
  email: 'メールアドレスの形式で入力してください',
};

const PHONE = /^\d{10,11}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 配送先の入力チェック（FR-4.2）。必須チェックと形式チェックをまとめて行い（建物名・部屋番号は任意）、
 * 項目ごとのエラー文言を返す。エラーがなければ空のオブジェクト。
 */
export function validateShipping(form: ShippingForm): ShippingErrors {
  const errors: ShippingErrors = {};
  if (form.name.trim() === '') errors.name = ERROR_MESSAGES.name;
  if (normalizePostalCode(form.postalCode) === null) {
    errors.postalCode = ERROR_MESSAGES.postalCode;
  }
  if (!isPrefecture(form.prefecture)) errors.prefecture = ERROR_MESSAGES.prefecture;
  if (form.city.trim() === '') errors.city = ERROR_MESSAGES.city;
  if (form.street.trim() === '') errors.street = ERROR_MESSAGES.street;
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

/**
 * 郵便番号から引いた住所を入力内容に反映する（FR-4.7）。都道府県と市区町村は上書きし、
 * 町名・番地は空か前回の自動入力の値のままのときだけ町名で置き換える（手で入れた番地は消さない）。
 */
export function applyAutofill(
  form: ShippingForm,
  plan: AutofillPlan,
  previousAutofill: string | null,
): ShippingForm {
  const street =
    plan.town !== null && shouldReplaceStreet(form.street, previousAutofill)
      ? plan.town
      : form.street;
  return { ...form, prefecture: plan.prefecture, city: plan.city, street };
}

/** 確認画面の住所の表示。例: "〒910-0005 福井県福井市大手3-17-1 フクイハイツ 201"（建物名が空なら省く）。 */
export function formatShippingAddress(form: ShippingForm): string {
  const zip7 = normalizePostalCode(form.postalCode);
  const postal = `〒${zip7 ? formatPostalCode(zip7) : form.postalCode.trim()}`;
  const main = `${form.prefecture}${form.city.trim()}${form.street.trim()}`;
  return [postal, main, form.building.trim()].filter((part) => part !== '').join(' ');
}
