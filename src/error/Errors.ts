export class NotFoundError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ServerError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

export class BadRequestError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}