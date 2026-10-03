import { useRef, useState, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { RadioGroup } from '../components/RadioGroup';
import { TextField } from '../components/TextField';
import { PRODUCTS } from '../data/products';
import { findProductById, formatPrice } from '../domain/catalog';
import { lineKey, lineSubtotal } from '../domain/cart';
import {
  DEFAULT_PAYMENT_METHOD,
  EMPTY_SHIPPING_FORM,
  PAYMENT_METHODS,
  firstErrorField,
  hasErrors,
  paymentLabel,
  validateShipping,
  type PaymentMethod,
  type ShippingErrors,
  type ShippingField,
  type ShippingForm,
} from '../domain/checkout';
import { useCart } from '../state/cartContext';
import { pageTitle } from './pageTitle';

type Step = 'input' | 'confirm';

/**
 * 注文手続き `/checkout`（US-7、US-8）。「配送先の入力」と「確認」の 2 段階を同じ画面で切り替える。
 * 入力内容は React の状態にだけ持ち、ブラウザには保存しない（NFR-2）。
 * カード番号などの入力欄は持たない（FR-4.3）。
 */
export function CheckoutPage() {
  const { lines, totalAmount, placeOrder } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('input');
  const [form, setForm] = useState<ShippingForm>(EMPTY_SHIPPING_FORM);
  const [payment, setPayment] = useState<PaymentMethod>(DEFAULT_PAYMENT_METHOD);
  const [errors, setErrors] = useState<ShippingErrors>({});
  const [placed, setPlaced] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // カートが空のまま開いたらカートへ（FR-4.6）。注文確定の直後はカートが空になるので除く
  if (lines.length === 0 && !placed) {
    return <Navigate to="/cart" replace />;
  }

  const update = (field: ShippingField) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    // 入力し直した項目のエラーは消す（次に「次へ」を押したときに再判定する）
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const goToStep = (next: Step) => {
    flushSync(() => setStep(next));
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  };

  const handleNext = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateShipping(form);
    if (hasErrors(result)) {
      // エラーを描画してから、最初のエラー項目にフォーカスを移す（A-8）
      flushSync(() => setErrors(result));
      const first = firstErrorField(result);
      // 入力欄の id は項目名と同じ（TextField の id）
      if (first) document.getElementById(first)?.focus();
      return;
    }
    setErrors({});
    goToStep('confirm');
  };

  const handlePlaceOrder = () => {
    setPlaced(true);
    placeOrder();
    navigate('/complete', { replace: true });
  };

  return (
    <div className="container page">
      <title>
        {pageTitle(step === 'input' ? 'ご注文手続き（配送先の入力）' : 'ご注文手続き（確認）')}
      </title>
      <div className="checkout">
        <h1 className="page-title" ref={headingRef} tabIndex={-1}>
          ご注文手続き
        </h1>
        <ol className="steps" aria-label="手続きの段階">
          <li aria-current={step === 'input' ? 'step' : undefined}>(1) 配送先の入力</li>
          <li aria-current={step === 'confirm' ? 'step' : undefined}>(2) 確認</li>
        </ol>

        {step === 'input' ? (
          <form onSubmit={handleNext} noValidate data-testid="checkout-input">
            <div className="form-grid">
              <TextField
                id="name"
                label="氏名"
                autoComplete="name"
                value={form.name}
                onChange={update('name')}
                error={errors.name}
              />
              <TextField
                id="postalCode"
                label="郵便番号"
                autoComplete="postal-code"
                inputMode="numeric"
                hint="例: 123-4567"
                value={form.postalCode}
                onChange={update('postalCode')}
                error={errors.postalCode}
              />
              <TextField
                id="address"
                label="住所"
                autoComplete="street-address"
                value={form.address}
                onChange={update('address')}
                error={errors.address}
              />
              <TextField
                id="phone"
                label="電話番号"
                type="tel"
                autoComplete="tel"
                hint="例: 090-1234-5678"
                value={form.phone}
                onChange={update('phone')}
                error={errors.phone}
              />
              <TextField
                id="email"
                label="メールアドレス"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={update('email')}
                error={errors.email}
              />
              <RadioGroup
                name="payment"
                legend="お支払い方法"
                options={PAYMENT_METHODS}
                value={payment}
                onChange={setPayment}
              >
                <p className="notice">※ デモのため、カード番号の入力や実際の決済は行いません</p>
              </RadioGroup>
            </div>
            <div className="checkout__footer">
              <p className="checkout__amount">
                注文金額（税込）{' '}
                <span data-testid="checkout-amount">{formatPrice(totalAmount)}</span>
              </p>
              <div className="checkout__actions">
                <Button type="submit" data-testid="checkout-next">
                  次へ
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div data-testid="checkout-confirm">
            <section className="confirm-section" aria-labelledby="confirm-items-heading">
              <h2 id="confirm-items-heading">ご注文の商品</h2>
              <ul className="confirm-items" data-testid="confirm-items">
                {lines.map((line) => {
                  const product = findProductById(PRODUCTS, line.productId);
                  if (!product) return null;
                  return (
                    <li key={lineKey(line)}>
                      <span>
                        {product.name} {line.color}/{line.size} ×{line.quantity}
                      </span>
                      <span>{formatPrice(lineSubtotal(line, product))}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="checkout__amount" style={{ marginTop: 'var(--space-3)' }}>
                合計（税込） <span data-testid="confirm-total">{formatPrice(totalAmount)}</span>
              </p>
            </section>
            <section className="confirm-section" aria-labelledby="confirm-shipping-heading">
              <h2 id="confirm-shipping-heading">配送先</h2>
              <dl className="confirm-list" data-testid="confirm-shipping">
                <dt>氏名</dt>
                <dd>{form.name.trim()}</dd>
                <dt>郵便番号</dt>
                <dd>〒{form.postalCode.trim()}</dd>
                <dt>住所</dt>
                <dd>{form.address.trim()}</dd>
                <dt>電話番号</dt>
                <dd>{form.phone.trim()}</dd>
                <dt>メールアドレス</dt>
                <dd>{form.email.trim()}</dd>
              </dl>
            </section>
            <section className="confirm-section" aria-labelledby="confirm-payment-heading">
              <h2 id="confirm-payment-heading">お支払い方法</h2>
              <p data-testid="confirm-payment">{paymentLabel(payment)}</p>
              <p className="notice">※ デモのため、実際の決済は行いません</p>
            </section>
            <div className="checkout__footer">
              <div className="checkout__actions">
                <Button
                  variant="secondary"
                  onClick={() => goToStep('input')}
                  data-testid="confirm-back"
                >
                  入力に戻る
                </Button>
                <Button
                  onClick={handlePlaceOrder}
                  disabled={placed}
                  data-testid="confirm-place-order"
                >
                  注文を確定する
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
