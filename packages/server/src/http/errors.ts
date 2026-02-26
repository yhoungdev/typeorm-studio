export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export function asHttpError(value: unknown): HttpError {
  if (value instanceof HttpError) {
    return value;
  }

  return new HttpError(500, "Internal server error");
}
