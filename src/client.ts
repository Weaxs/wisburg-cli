export class WisburgError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WisburgError";
  }
}

export class WisburgHttpError extends WisburgError {
  readonly status: number;
  readonly body: string;

  constructor(status: number, body: string) {
    super(`Wisburg API request failed with HTTP ${status}: ${body}`);
    this.name = "WisburgHttpError";
    this.status = status;
    this.body = body;
  }
}

export type RequestParams = Record<string, string | number | boolean | undefined | null>;

export type ClientOptions = {
  apiKey: string;
  baseUrl: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export class WisburgClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl;
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  get(path: string, params?: RequestParams): Promise<{ payload: unknown; raw: string }> {
    return this.request("GET", path, { params });
  }

  async request(
    method: string,
    path: string,
    options: { params?: RequestParams; body?: unknown } = {},
  ): Promise<{ payload: unknown; raw: string }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(buildUrl(this.baseUrl, path, options.params), {
        method: method.toUpperCase(),
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
          "User-Agent": "wisburg-cli/0.1.0",
          ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });

      const raw = await response.text();
      if (!response.ok) {
        throw new WisburgHttpError(response.status, raw);
      }

      try {
        return { payload: JSON.parse(raw), raw };
      } catch {
        return { payload: raw, raw };
      }
    } catch (error) {
      if (error instanceof WisburgError) {
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new WisburgError(`Wisburg API request timed out after ${this.timeoutMs}ms`);
      }
      throw new WisburgError(error instanceof Error ? error.message : String(error));
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function buildUrl(baseUrl: string, path: string, params: RequestParams = {}): string {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}
