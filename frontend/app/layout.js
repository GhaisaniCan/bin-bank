import { Outfit } from "next/font/google"
import "./globals.css"
import Toast from "@/components/Toast"

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-outfit",
  display: "swap",
})

export const metadata = {
  title: "BinBank",
  description: "Bank sampah digital RW",
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={outfit.variable}>
      <body>
        {children}
        <Toast />
      </body>
    </html>
  )
}