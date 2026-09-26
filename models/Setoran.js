const mongoose = require("mongoose");

const rincianSetoranSchema = new mongoose.Schema(
  {
    jenisSampah: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JenisSampah",
      required: [true, "jenis sampah wajib diisi"],
    },
    namaSampah: {
      type: String,
      required: [true, "nama sampah wajib diisi"],
      trim: true,
    },
    hargaPerKg: {
      type: Number,
      required: [true, "harga per kg wajib diisi"],
      min: [0, "harga per kg tidak boleh negatif"],
    },
    berat: {
      type: Number,
      required: [true, "berat wajib diisi"],
      validate: {
        validator: (nilai) => nilai > 0,
        message: "berat harus lebih dari 0",
      },
    },
    subtotal: {
      type: Number,
      required: [true, "subtotal wajib diisi"],
      min: [0, "subtotal tidak boleh negatif"],
    },
  },
  { _id: false }
);

const setoranSchema = new mongoose.Schema(
  {
    nasabah: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "nasabah wajib diisi"],
      index: true,
    },
    petugas: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "petugas wajib diisi"],
    },
    tanggal: {
      type: Date,
      default: Date.now,
      index: true,
    },
    rincian: {
      type: [rincianSetoranSchema],
      validate: {
        validator: (daftar) => Array.isArray(daftar) && daftar.length > 0,
        message: "rincian setoran minimal berisi satu jenis sampah",
      },
    },
    totalBerat: {
      type: Number,
      required: [true, "total berat wajib diisi"],
      min: [0, "total berat tidak boleh negatif"],
    },
    totalNilai: {
      type: Number,
      required: [true, "total nilai wajib diisi"],
      min: [0, "total nilai tidak boleh negatif"],
    },
    status: {
      type: String,
      enum: {
        values: ["TERCATAT", "DIBATALKAN"],
        message: "status hanya boleh TERCATAT atau DIBATALKAN",
      },
      default: "TERCATAT",
    },
    catatan: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

setoranSchema.index({ nasabah: 1, tanggal: -1 });

module.exports = mongoose.model("Setoran", setoranSchema);
