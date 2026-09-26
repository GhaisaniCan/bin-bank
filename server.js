require("dotenv").config()
const dns = require("dns")
dns.setServers(["8.8.8.8", "8.8.4.4"])
const express = require("express")
const connectDB = require("./config/db")

connectDB()

const app = express()
app.use(express.json())

const authController = require("./controllers/authController")
app.use("/auth", authController)

//-------------------- idk what im doing dont mind me ---------------------
const jenisSampahController = require("./controllers/jenisSampahController")
app.use("/jenis-sampah", jenisSampahController)
//-------------------- idk what im doing dont mind me ---------------------

app.get("/ping", (req, res) => res.json({ "data": "pong" }))
app.listen(5001, () => console.log("Server is up and running"))

const penarikanController = require("./controllers/penarikanController")
app.use("/penarikan", penarikanController)