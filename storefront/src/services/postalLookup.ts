import { parseZipcloudResponse, type AddressLookupResult } from '../domain/address';

/**
 * 郵便番号検索 API（zipcloud、API キー不要）。このアプリで外部に接続するのはここだけ（NFR-1 の例外、CR-1）。
 * 送るのは郵便番号 7 桁だけで、Cookie やリファラーは送らない。
 */
const ZIPCLOUD_ENDPOINT = 'https://zipcloud.ibsnet.co.jp/api/search';

/** 応答を待つ上限。これを過ぎたら手入力を案内する。 */
export const LOOKUP_TIMEOUT_MS = 5000;

/**
 * 郵便番号から住所を引く。通信エラー・タイムアウト・HTTP エラー・JSON の解析エラーはすべて
 * `{ kind: 'error' }` にして返し、画面には例外を投げない（理由は console.warn に出す）。
 * 呼び出し側の `signal` で中断したとき（新しい郵便番号が入力されたときなど）も error を返すので、
 * 呼び出し側は `signal.aborted` を見て結果を捨てること。
 */
export async function lookupAddress(
  zip7: string,
  signal?: AbortSignal,
): Promise<AddressLookupResult> {
  if (!/^\d{7}$/.test(zip7)) {
    return { kind: 'error', message: '郵便番号は 7 桁の数字で指定してください' };
  }

  // 呼び出し側の中断と 5 秒のタイムアウトを 1 つの AbortController にまとめる
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, LOOKUP_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abortFromCaller, { once: true });

  try {
    const response = await fetch(`${ZIPCLOUD_ENDPOINT}?zipcode=${zip7}`, {
      signal: controller.signal,
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
    });
    if (!response.ok) {
      console.warn(`郵便番号検索に失敗しました（HTTP ${response.status}）。手入力を案内します。`);
      return { kind: 'error', message: `HTTP ${response.status}` };
    }
    // zipcloud は Content-Type が text/plain なので、テキストで受けてから JSON として読む
    const json: unknown = JSON.parse(await response.text());
    const result = parseZipcloudResponse(json);
    if (result.kind === 'error') {
      console.warn(`郵便番号検索でエラーが返りました: ${result.message}`);
    }
    return result;
  } catch (error) {
    if (signal?.aborted && !timedOut) {
      // 新しい入力で置き換えられた検索。利用者の操作なので警告は出さない
      return { kind: 'error', message: 'aborted' };
    }
    const message = timedOut
      ? `${LOOKUP_TIMEOUT_MS / 1000} 秒以内に応答がありませんでした`
      : error instanceof Error
        ? error.message
        : String(error);
    console.warn(`郵便番号検索に失敗しました（${message}）。手入力を案内します。`, error);
    return { kind: 'error', message };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}
