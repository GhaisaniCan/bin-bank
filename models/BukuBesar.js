const mongoose = require("mongoose");

// Buku besar digital: catatan mutasi saldo nasabah.
// Sifatnya append-only, jadi catatan tidak boleh diubah atau dihapus.
// Koreksi dilakukan dengan menambah catatan pembalik, bukan mengedit catatan lama.
const bukuBesarSchema = new mongoose.Schema(
  {
    nasabah: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "nasabah wajib diisi"],
      index: true,
    },
    // KREDIT menambah saldo (setoran), DEBIT mengurangi saldo (penarikan disetujui).
    tipe: {
      type: String,
      enum: {
        values: ["KREDIT", "DEBIT"],
        message: "tipe hanya boleh KREDIT atau DEBIT",
      },
      required: [true, "tipe wajib diisi"],
    },
    jumlah: {
      type: Number,
      required: [true, "jumlah wajib diisi"],
      validate: {
        validator: (nilai) => nilai > 0,
        message: "jumlah harus lebih dari 0",
      },
    },
    // Saldo nasabah setelah transaksi ini dibukukan, supaya riwayat tetap bisa ditelusuri.
    saldoSetelah: {
      type: Number,
      required: [true, "saldo setelah transaksi wajib diisi"],
      min: [0, "saldo setelah transaksi tidak boleh negatif"],
    },
    sumber: {
      type: String,
      enum: {
        values: ["SETORAN", "PENARIKAN", "PEMBATALAN_SETORAN"],
        message: "sumber tidak dikenali",
      },
      required: [true, "sumber wajib diisi"],
    },
    // ID dokumen asal mutasi: Setoran untuk SETORAN, Penarikan untuk PENARIKAN.
    referensiId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "referensi id wajib diisi"],
    },
    keterangan: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Dipakai endpoint mutasi/riwayat (Modul D): ambil catatan nasabah, terbaru dulu.
bukuBesarSchema.index({ nasabah: 1, createdAt: -1 });

// Ditulis sebagai async function tanpa parameter `next`, bukan gaya callback.
// Mongoose 9 sudah tidak mengirim `next` ke middleware, sedangkan gaya promise
// ini dikenali sejak Mongoose 5, jadi hook tetap jalan di semua versi tersebut.
async function tolakPerubahan() {
  throw new Error("Catatan buku besar tidak dapat diubah atau dihapus");
}

// Kunci semua jalur ubah/hapus lewat query.
[
  "updateOne",
  "updateMany",
  "findOneAndUpdate",
  "findOneAndReplace",
  "replaceOne",
  "deleteOne",
  "deleteMany",
  "findOneAndDelete",
].forEach((operasi) => {
  bukuBesarSchema.pre(operasi, { query: true, document: false }, tolakPerubahan);
});

// Kunci juga jalur dokumen: menyimpan ulang dokumen yang sudah ada, dan menghapusnya.
bukuBesarSchema.pre("save", { document: true, query: false }, async function () {
  if (!this.isNew) {
    await tolakPerubahan();
  }
});

bukuBesarSchema.pre("deleteOne", { document: true, query: false }, tolakPerubahan);

module.exports = mongoose.model("BukuBesar", bukuBesarSchema);
