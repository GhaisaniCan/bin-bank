class AppError extends Error {
  constructor(pesan, statusCode = 400) {
    super(pesan);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.operasional = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
