require("dotenv").config()
const express = require("express")
const connectDB = require("./config/db")

connectDB()

const app = express()
app.use(express.json())

const authController = require("./controllers/authController")
app.use("/auth", authController)

app.get("/ping", (req, res) => res.json({ "data": "pong" }))
app.listen(5001, () => console.log("Server is up and running"))