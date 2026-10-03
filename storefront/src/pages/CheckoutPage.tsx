import { useEffect, useRef, useState, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { RadioGroup } from '../components/RadioGroup';
import { SelectField } from '../components/SelectField';
import { TextField } from '../components/TextField';
import { PRODUCTS } from '../data/products';
import { findProductById, formatPrice } from '../domain/catalog';
import { lineKey, lineSubtotal } from '../domain/cart';
import {
  AUTOFILL_MESSAGES,
  PREFECTURES,
  isPrefecture,
  normalizePostalCode,
  planAutofill,
  type AutofillStatus,
} from '../domain/address';
import {
  DEFAULT_PAYMENT_METHOD,
  EMPTY_SHIPPING_FORM,
  PAYMENT_METHODS,
  applyAutofill,
  firstErrorField,
  formatShippingAddress,
  hasErrors,
  paymentLabel,
  validateShipping,
  type PaymentMethod,
  type ShippingErrors,
  type ShippingField,
  type ShippingForm,
} from '../domain/checkout';
import { lookupAddress } from '../services/postalLookup';
import { useCart } from '../state/cartContext';
import { pageTitle } from './pageTitle';

type Step = 'input' | 'confirm';

/**
 * 注文手続き `/checkout`（US-7、US-8）。「配送先の入力」と「確認」の 2 段階を同じ画面で切り替える。
 * 入力内容は React の状態にだけ持ち、ブラウザには保存しない（NFR-2）。
 * カード番号などの入力欄は持たない（FR-4.3）。
 * 郵便番号が 7 桁になったら zipcloud で住所を引いて自動入力する（FR-4.7、CR-1）。外部に送るのは郵便番号だけ。
 */
export function CheckoutPage() {
  const { lines, totalAmount, placeOrder } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('input');
  const [form, setForm] = useState<ShippingForm>(EMPTY_SHIPPING_FORM);
  const [payment, setPayment] = useState<PaymentMethod>(DEFAULT_PAYMENT_METHOD);
  const [errors, setErrors] = useState<ShippingErrors>({});
  const [placed, setPlaced] = useState(false);
  const [autofill, setAutofill] = useState<AutofillStatus>('idle');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const streetRef = useRef<HTMLInputElement>(null);
  /** 実行中の住所検索（新しい郵便番号が入ったら中断する）。 */
  const lookupRef = useRef<AbortController | null>(null);
  /** 最後に検索を始めた郵便番号（ハイフンの有無だけ違う入力で引き直さないため）。 */
  const lookupZipRef = useRef<string | null>(null);
  /** 前回自動入力した町名（利用者が手を入れていなければ、次の自動入力で置き換えてよい）。 */
  const lastAutofillStreetRef = useRef<string | null>(null);

  // 画面を離れたら実行中の住所検索を中断する
  useEffect(() => () => lookupRef.current?.abort(), []);

  // カートが空のまま開いたらカートへ（FR-4.6）。注文確定の直後はカートが空になるので除く
  if (lines.length === 0 && !placed) {
    return <Navigate to="/cart" replace />;
  }

  const clearErrors = (fields: readonly ShippingField[]) => {
    setErrors((current) => {
      if (!fields.some((field) => current[field])) return current;
      const next = { ...current };
      for (const field of fields) delete next[field];
      return next;
    });
  };

  const update =
    <F extends ShippingField>(field: F) =>
    (value: ShippingForm[F]) => {
      setForm((current) => ({ ...current, [field]: value }));
      // 入力し直した項目のエラーは消す（次に「次へ」を押したときに再判定する）
      clearErrors([field]);
    };

  const cancelLookup = () => {
    lookupRef.current?.abort();
    lookupRef.current = null;
    lookupZipRef.current = null;
  };

  const startLookup = async (zip7: string) => {
    cancelLookup();
    const controller = new AbortController();
    lookupRef.current = controller;
    lookupZipRef.current = zip7;
    setAutofill('loading');

    const result = await lookupAddress(zip7, controller.signal);
    // 待っている間に別の郵便番号が入った・画面を離れた・「次へ」で進んだときは捨てる
    if (controller.signal.aborted) return;
    lookupRef.current = null;

    const plan = result.kind === 'found' ? planAutofill(result.candidates) : null;
    if (!plan) {
      // 見つからない・通信できないときは案内だけ出す（入力チェックのエラーではなく、「次へ」は止めない）
      setAutofill(result.kind === 'error' ? 'error' : 'notFound');
      return;
    }

    const postalField = document.getElementById('postalCode');
    const stillOnPostalCode = document.activeElement === postalField;
    const previousAutofill = lastAutofillStreetRef.current;
    flushSync(() => {
      setForm((current) => applyAutofill(current, plan, previousAutofill));
      setAutofill(plan.outcome);
    });
    if (plan.town !== null) lastAutofillStreetRef.current = plan.town;

    const street = streetRef.current;
    const streetFilled = street !== null && street.value.trim() !== '';
    clearErrors(streetFilled ? ['prefecture', 'city', 'street'] : ['prefecture', 'city']);
    // 町名・番地の欄へ移り、カーソルを末尾に置いて続けて番地を打てるようにする。
    // 利用者がすでに別の欄へ移っていたら、フォーカスは奪わない
    if (street && stillOnPostalCode) {
      street.focus();
      const end = street.value.length;
      street.setSelectionRange(end, end);
    }
  };

  const handlePostalCodeChange = (value: string) => {
    update('postalCode')(value);
    const zip7 = normalizePostalCode(value);
    if (zip7 === null) {
      // 7 桁でなくなったら、実行中の検索と前の案内を取り消す
      if (lookupZipRef.current !== null) {
        cancelLookup();
        setAutofill('idle');
      }
      return;
    }
    if (zip7 === lookupZipRef.current) return;
    void startLookup(zip7);
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
    // 確認の段階で住所が書き換わらないよう、実行中の検索は中断する
    if (lookupRef.current) {
      cancelLookup();
      setAutofill('idle');
    }
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
                hint="例: 123-4567。7 桁を入力すると住所を自動入力します"
                value={form.postalCode}
                onChange={handlePostalCodeChange}
                error={errors.postalCode}
              >
                {/* 住所の自動入力の状態（読み上げ用のライブリージョンなので、空でも常に置いておく） */}
                <p
                  className="autofill-status"
                  role="status"
                  data-status={autofill}
                  data-testid="checkout-postal-status"
                >
                  {AUTOFILL_MESSAGES[autofill]}
                </p>
              </TextField>
              <SelectField
                id="prefecture"
                label="都道府県"
                autoComplete="address-level1"
                options={PREFECTURES}
                value={form.prefecture}
                onChange={(value) => update('prefecture')(isPrefecture(value) ? value : '')}
                error={errors.prefecture}
              />
              <TextField
                id="city"
                label="市区町村"
                autoComplete="address-level2"
                placeholder="例: 福井市"
                value={form.city}
                onChange={update('city')}
                error={errors.city}
              />
              <TextField
                id="street"
                label="町名・番地"
                autoComplete="address-line1"
                placeholder="例: 大手3-17-1"
                ref={streetRef}
                value={form.street}
                onChange={update('street')}
                error={errors.street}
              />
              <TextField
                id="building"
                label="建物名・部屋番号"
                autoComplete="address-line2"
                placeholder="例: フクイハイツ 201"
                required={false}
                value={form.building}
                onChange={update('building')}
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
                <dt>住所</dt>
                <dd data-testid="confirm-address">{formatShippingAddress(form)}</dd>
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
