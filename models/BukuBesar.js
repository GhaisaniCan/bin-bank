const mongoose = require("mongoose");

const bukuBesarSchema = new mongoose.Schema(
  {
    nasabah: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "nasabah wajib diisi"],
      index: true,
    },
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

bukuBesarSchema.index({ nasabah: 1, createdAt: -1 });

async function tolakPerubahan() {
  throw new Error("Catatan buku besar tidak dapat diubah atau dihapus");
}

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

bukuBesarSchema.pre("save", { document: true, query: false }, async function () {
  if (!this.isNew) {
    await tolakPerubahan();
  }
});

bukuBesarSchema.pre("deleteOne", { document: true, query: false }, tolakPerubahan);

module.exports = mongoose.model("BukuBesar", bukuBesarSchema);
