import { describe, expect, it } from 'vitest';
import {
  ERROR_MESSAGES,
  firstErrorField,
  hasErrors,
  normalizeDigits,
  validateShipping,
  type ShippingForm,
} from './checkout';
import { ORDER_NUMBER_PATTERN, generateOrderNumber } from './order';

const valid: ShippingForm = {
  name: '田中 健太',
  postalCode: '910-0005',
  address: '福井県福井市大手 3-10-1',
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

  it('全部空なら 5 項目すべてにエラーが出て、最初のエラー項目は氏名', () => {
    const errors = validateShipping({
      name: '',
      postalCode: '',
      address: '',
      phone: '',
      email: '',
    });
    expect(Object.keys(errors)).toHaveLength(5);
    expect(firstErrorField(errors)).toBe('name');
    expect(firstErrorField({ phone: ERROR_MESSAGES.phone, email: ERROR_MESSAGES.email })).toBe(
      'phone',
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
