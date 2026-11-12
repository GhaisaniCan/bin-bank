const jwt = require("jsonwebtoken")

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan" })
  }

  const token = authHeader.split(" ")[1]

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid atau kedaluwarsa" })
  }

  const jalurGantiPassword =
    req.method === "PATCH" && req.originalUrl.split("?")[0] === "/auth/password"

  if (decoded.wajibGantiPassword && !jalurGantiPassword) {
    return res.status(403).json({
      message: "Anda harus mengganti password terlebih dahulu",
      wajibGantiPassword: true,
    })
  }

  req.user = decoded
  next()
}

module.exports = authenticate