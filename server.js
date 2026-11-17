require("dotenv").config()
if (process.env.NODE_ENV !== "production") {
  const dns = require("dns")
  dns.setServers(["8.8.8.8", "8.8.4.4"])
}
const express = require("express")
const cors = require("cors")
const connectDB = require("./config/db")

connectDB()

const app = express()
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }))
app.use(express.json())

const authController = require("./controllers/authController")
app.use("/auth", authController)

const userRoutes = require("./routes/userRoutes")
app.use("/users", userRoutes)

//-------------------- idk what im doing dont mind me ---------------------
const jenisSampahRoutes = require("./routes/jenisSampahRoutes");
app.use("/jenis-sampah", jenisSampahRoutes);

const laporanRoutes = require("./routes/laporanRoutes")
app.use("/laporan", laporanRoutes)
//-------------------- idk what im doing dont mind me ---------------------

const penarikanController = require("./controllers/penarikanController")
app.use("/penarikan", penarikanController)

const setoranRoutes = require("./routes/setoranRoutes")
app.use("/setoran", setoranRoutes)

const nasabahRoutes = require("./routes/nasabahRoutes")
app.use("/nasabah", nasabahRoutes)

app.get("/", (req, res) => res.json({ message: "Bin Bank API is running" }))
app.get("/ping", (req, res) => res.json({ "data": "pong" }))

const PORT = process.env.PORT || 5001
app.listen(PORT, () => console.log(`Server is up and running on port ${PORT}`))