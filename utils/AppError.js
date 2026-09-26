// Error yang sudah membawa kode status HTTP, supaya controller tidak perlu
// menebak error mana yang salah pengguna (4xx) dan mana yang salah server (5xx).
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
