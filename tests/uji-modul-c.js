const mongoose = require("mongoose");
const { MongoMemoryReplSet } = require("mongodb-memory-server");

function daftarkanModelPihakLain() {
  require("../models/User");
  require("../models/JenisSampah");
}

let lulus = 0;
let gagal = 0;

async function cek(nama, fn) {
  try {
    await fn();
    lulus += 1;
    console.log(`  OK   ${nama}`);
  } catch (error) {
    gagal += 1;
    console.log(`  GAGAL ${nama}\n        ${error.message}`);
  }
}

function harus(kondisi, pesan) {
  if (!kondisi) throw new Error(pesan);
}

async function main() {
  const replset = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: "wiredTiger" } });
  await mongoose.connect(replset.getUri(), { dbName: "binbank_uji" });

  daftarkanModelPihakLain();

  const Setoran = require("../models/Setoran");
  const BukuBesar = require("../models/BukuBesar");
  const ledgerService = require("../services/ledgerService");
  const setoranService = require("../services/setoranService");

  const User = mongoose.model("User");
  const JenisSampah = mongoose.model("JenisSampah");

  const nasabah = await User.create({ nama: "Budi Santoso", email: "budi@mail.com", password: "hash", role: "nasabah" });
  const petugas = await User.create({ nama: "Siti Petugas", email: "siti@mail.com", password: "hash", role: "petugas" });
  const pet = await JenisSampah.create({ nama: "Plastik PET", hargaPerKg: 3000 });
  const kardus = await JenisSampah.create({ nama: "Kardus", hargaPerKg: 1500 });

  console.log("\nFitur 4 — Pencatatan Setoran");

  let setoranPertama;
  await cek("setoran tercatat dan nilai dihitung server", async () => {
    const hasil = await setoranService.catatSetoran({
      nasabah: nasabah._id,
      petugas: petugas._id,
      rincian: [
        { jenisSampah: pet._id, berat: 2.5 },
        { jenisSampah: kardus._id, berat: 1.2 },
      ],
    });
    setoranPertama = hasil.setoran;
    harus(hasil.setoran.totalNilai === 9300, `totalNilai ${hasil.setoran.totalNilai} bukan 9300`);
    harus(hasil.setoran.totalBerat === 3.7, `totalBerat ${hasil.setoran.totalBerat} bukan 3.7`);
    harus(hasil.setoran.rincian[0].subtotal === 7500, "subtotal PET salah");
    harus(hasil.setoran.status === "TERCATAT", "status awal bukan TERCATAT");
  });

  await cek("harga disalin (snapshot) ke dalam setoran", async () => {
    harus(setoranPertama.rincian[0].hargaPerKg === 3000, "hargaPerKg tidak tersalin");
    harus(setoranPertama.rincian[0].namaSampah === "Plastik PET", "namaSampah tidak tersalin");
  });

  await cek("perubahan harga tidak mengubah setoran lama", async () => {
    await JenisSampah.findByIdAndUpdate(pet._id, { hargaPerKg: 9999 });
    const lama = await Setoran.findById(setoranPertama._id);
    harus(lama.rincian[0].hargaPerKg === 3000, "setoran lama ikut berubah");
    harus(lama.totalNilai === 9300, "totalNilai lama ikut berubah");
    await JenisSampah.findByIdAndUpdate(pet._id, { hargaPerKg: 3000 });
  });

  await cek("berat 0 ditolak", async () => {
    try {
      await setoranService.catatSetoran({
        nasabah: nasabah._id, petugas: petugas._id,
        rincian: [{ jenisSampah: pet._id, berat: 0 }],
      });
      throw new Error("seharusnya ditolak");
    } catch (error) {
      harus(error.statusCode === 400, `status ${error.statusCode} bukan 400`);
    }
  });

  await cek("rincian kosong ditolak", async () => {
    try {
      await setoranService.catatSetoran({ nasabah: nasabah._id, petugas: petugas._id, rincian: [] });
      throw new Error("seharusnya ditolak");
    } catch (error) {
      harus(error.statusCode === 400, `status ${error.statusCode} bukan 400`);
    }
  });

  await cek("nasabah tidak terdaftar ditolak 404", async () => {
    try {
      await setoranService.catatSetoran({
        nasabah: new mongoose.Types.ObjectId(), petugas: petugas._id,
        rincian: [{ jenisSampah: pet._id, berat: 1 }],
      });
      throw new Error("seharusnya ditolak");
    } catch (error) {
      harus(error.statusCode === 404, `status ${error.statusCode} bukan 404`);
    }
  });

  await cek("petugas tidak bisa dijadikan nasabah setoran", async () => {
    try {
      await setoranService.catatSetoran({
        nasabah: petugas._id, petugas: petugas._id,
        rincian: [{ jenisSampah: pet._id, berat: 1 }],
      });
      throw new Error("seharusnya ditolak");
    } catch (error) {
      harus(error.statusCode === 404, `status ${error.statusCode} bukan 404`);
    }
  });

  await cek("jenis sampah tidak dikenal ditolak 404", async () => {
    try {
      await setoranService.catatSetoran({
        nasabah: nasabah._id, petugas: petugas._id,
        rincian: [{ jenisSampah: new mongoose.Types.ObjectId(), berat: 1 }],
      });
      throw new Error("seharusnya ditolak");
    } catch (error) {
      harus(error.statusCode === 404, `status ${error.statusCode} bukan 404`);
    }
  });

  await cek("setoran gagal tidak meninggalkan data (rollback)", async () => {
    const jumlahSetoran = await Setoran.countDocuments();
    const jumlahLedger = await BukuBesar.countDocuments();
    harus(jumlahSetoran === 1, `ada ${jumlahSetoran} setoran, seharusnya 1`);
    harus(jumlahLedger === 1, `ada ${jumlahLedger} catatan buku besar, seharusnya 1`);
  });

  console.log("\nFitur 5 — Akumulasi Saldo Otomatis (Buku Besar)");

  await cek("saldo nasabah bertambah otomatis", async () => {
    const terbaru = await User.findById(nasabah._id);
    harus(terbaru.saldo === 9300, `saldo ${terbaru.saldo} bukan 9300`);
  });

  await cek("catatan buku besar dibuat dengan saldoSetelah", async () => {
    const catatan = await BukuBesar.findOne({ referensiId: setoranPertama._id });
    harus(catatan.tipe === "KREDIT", "tipe bukan KREDIT");
    harus(catatan.jumlah === 9300, "jumlah salah");
    harus(catatan.saldoSetelah === 9300, "saldoSetelah salah");
    harus(catatan.sumber === "SETORAN", "sumber salah");
  });

  await cek("setoran kedua menambah saldo, bukan menimpa", async () => {
    await setoranService.catatSetoran({
      nasabah: nasabah._id, petugas: petugas._id,
      rincian: [{ jenisSampah: kardus._id, berat: 2 }],
    });
    const terbaru = await User.findById(nasabah._id);
    harus(terbaru.saldo === 12300, `saldo ${terbaru.saldo} bukan 12300`);
  });

  await cek("catatan buku besar tidak bisa diubah", async () => {
    const catatan = await BukuBesar.findOne();
    try {
      await BukuBesar.updateOne({ _id: catatan._id }, { jumlah: 1 });
      throw new Error("update seharusnya ditolak");
    } catch (error) {
      harus(error.message.includes("tidak dapat diubah"), `pesan tak terduga: ${error.message}`);
    }
  });

  await cek("catatan buku besar tidak bisa dihapus", async () => {
    const catatan = await BukuBesar.findOne();
    try {
      await BukuBesar.deleteOne({ _id: catatan._id });
      throw new Error("delete seharusnya ditolak");
    } catch (error) {
      harus(error.message.includes("tidak dapat diubah"), `pesan tak terduga: ${error.message}`);
    }
  });

  await cek("dokumen buku besar lama tidak bisa disimpan ulang", async () => {
    const catatan = await BukuBesar.findOne();
    catatan.jumlah = 1;
    try {
      await catatan.save();
      throw new Error("save seharusnya ditolak");
    } catch (error) {
      harus(error.message.includes("tidak dapat diubah"), `pesan tak terduga: ${error.message}`);
    }
  });

  console.log("\nledgerService — dipakai Modul D");

  await cek("debit mengurangi saldo dan mencatat DEBIT", async () => {
    const session = await mongoose.startSession();
    const referensiId = new mongoose.Types.ObjectId();
    try {
      await session.withTransaction(async () => {
        await ledgerService.debit(
          { nasabahId: nasabah._id, jumlah: 5000, referensiId, keterangan: "Penarikan tunai" },
          session
        );
      });
    } finally {
      await session.endSession();
    }
    const terbaru = await User.findById(nasabah._id);
    harus(terbaru.saldo === 7300, `saldo ${terbaru.saldo} bukan 7300`);
    const catatan = await BukuBesar.findOne({ referensiId });
    harus(catatan.tipe === "DEBIT" && catatan.saldoSetelah === 7300, "catatan debit salah");
  });

  await cek("debit melebihi saldo ditolak dan saldo tidak berubah", async () => {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await ledgerService.debit(
          { nasabahId: nasabah._id, jumlah: 999999, referensiId: new mongoose.Types.ObjectId() },
          session
        );
      });
      throw new Error("seharusnya ditolak");
    } catch (error) {
      harus(error.statusCode === 400, `status ${error.statusCode} bukan 400`);
    } finally {
      await session.endSession();
    }
    const terbaru = await User.findById(nasabah._id);
    harus(terbaru.saldo === 7300, `saldo berubah menjadi ${terbaru.saldo}`);
  });

  await cek("ledgerService menolak dipanggil tanpa session", async () => {
    try {
      await ledgerService.credit({ nasabahId: nasabah._id, jumlah: 1000, referensiId: new mongoose.Types.ObjectId() });
      throw new Error("seharusnya ditolak");
    } catch (error) {
      harus(error.statusCode === 500, `status ${error.statusCode} bukan 500`);
    }
  });

  await cek("ambilSaldo mengembalikan saldo terkini", async () => {
    const saldo = await ledgerService.ambilSaldo(nasabah._id);
    harus(saldo === 7300, `saldo ${saldo} bukan 7300`);
  });

  await cek("dua setoran bersamaan tidak saling menimpa saldo", async () => {
    const sebelum = (await User.findById(nasabah._id)).saldo;
    await Promise.all([
      setoranService.catatSetoran({ nasabah: nasabah._id, petugas: petugas._id, rincian: [{ jenisSampah: kardus._id, berat: 1 }] }),
      setoranService.catatSetoran({ nasabah: nasabah._id, petugas: petugas._id, rincian: [{ jenisSampah: kardus._id, berat: 1 }] }),
    ]);
    const sesudah = (await User.findById(nasabah._id)).saldo;
    harus(sesudah === sebelum + 3000, `saldo ${sesudah}, seharusnya ${sebelum + 3000}`);
  });

  console.log("\nLapisan kompatibilitas — panggilan gaya lama Modul D");

  await cek("getSaldo gaya lama membaca saldo terkini", async () => {
    const saldo = await ledgerService.getSaldo(nasabah._id);
    const terbaru = await User.findById(nasabah._id);
    harus(saldo === terbaru.saldo, `getSaldo ${saldo} tidak sama dengan User.saldo ${terbaru.saldo}`);
  });

  await cek("debit gaya lama mengurangi saldo dan tercatat sebagai PENARIKAN", async () => {
    const sebelum = (await User.findById(nasabah._id)).saldo;
    const referensiPenarikan = new mongoose.Types.ObjectId();
    await ledgerService.debit(nasabah._id, 1300, "Penarikan tunai", {
      tipe: "penarikan",
      id: referensiPenarikan,
    });
    const sesudah = (await User.findById(nasabah._id)).saldo;
    harus(sesudah === sebelum - 1300, `saldo ${sesudah}, seharusnya ${sebelum - 1300}`);

    const catatan = await BukuBesar.findOne({ referensiId: referensiPenarikan });
    harus(catatan.tipe === "DEBIT", "tipe bukan DEBIT");
    harus(catatan.sumber === "PENARIKAN", `sumber ${catatan.sumber} bukan PENARIKAN`);
    harus(catatan.saldoSetelah === sesudah, "saldoSetelah tidak sesuai");
  });

  await cek("debit gaya lama melebihi saldo ditolak", async () => {
    const sebelum = (await User.findById(nasabah._id)).saldo;
    try {
      await ledgerService.debit(nasabah._id, 999999, "Penarikan tunai", {
        tipe: "penarikan",
        id: new mongoose.Types.ObjectId(),
      });
      throw new Error("seharusnya ditolak");
    } catch (error) {
      harus(error.statusCode === 400, `status ${error.statusCode} bukan 400`);
    }
    const sesudah = (await User.findById(nasabah._id)).saldo;
    harus(sesudah === sebelum, `saldo berubah menjadi ${sesudah}`);
  });

  await cek("getRiwayat gaya lama mengembalikan mutasi terbaru dulu", async () => {
    const riwayat = await ledgerService.getRiwayat(nasabah._id);
    harus(riwayat.length > 0, "riwayat kosong");
    harus(riwayat[0].tipe === "DEBIT", "mutasi terbaru bukan penarikan tadi");
    const urut = riwayat.every(
      (catatan, i) => i === 0 || riwayat[i - 1].createdAt >= catatan.createdAt
    );
    harus(urut, "riwayat tidak terurut dari yang terbaru");
  });

  console.log("\nDaftar & detail setoran");

  await cek("daftar setoran terurut dan berpaginasi", async () => {
    const hasil = await setoranService.daftarSetoran({ halaman: 1, limit: 2 });
    harus(hasil.data.length === 2, `dapat ${hasil.data.length} data, seharusnya 2`);
    harus(hasil.paginasi.total === 4, `total ${hasil.paginasi.total}, seharusnya 4`);
    harus(hasil.data[0].nasabah.nama === "Budi Santoso", "populate nasabah gagal");
  });

  await cek("filter nasabah bekerja", async () => {
    const hasil = await setoranService.daftarSetoran({ nasabah: petugas._id });
    harus(hasil.paginasi.total === 0, "filter nasabah tidak bekerja");
  });

  await cek("filter tanggal 'sampai' inklusif hari ini", async () => {
    const hariIni = new Date().toISOString().slice(0, 10);
    const hasil = await setoranService.daftarSetoran({ dari: hariIni, sampai: hariIni });
    harus(hasil.paginasi.total === 4, `total ${hasil.paginasi.total}, seharusnya 4`);
  });

  await cek("nasabah lain ditolak membuka detail setoran", async () => {
    const orangLain = new mongoose.Types.ObjectId();
    try {
      await setoranService.detailSetoran(setoranPertama._id, { id: orangLain, role: "nasabah" });
      throw new Error("seharusnya ditolak");
    } catch (error) {
      harus(error.statusCode === 403, `status ${error.statusCode} bukan 403`);
    }
  });

  await cek("nasabah pemilik boleh membuka detail setorannya", async () => {
    const hasil = await setoranService.detailSetoran(setoranPertama._id, { id: nasabah._id, role: "nasabah" });
    harus(String(hasil._id) === String(setoranPertama._id), "detail salah");
  });

  await cek("ID setoran tidak valid ditolak 400", async () => {
    try {
      await setoranService.detailSetoran("bukan-objectid", { role: "admin" });
      throw new Error("seharusnya ditolak");
    } catch (error) {
      harus(error.statusCode === 400, `status ${error.statusCode} bukan 400`);
    }
  });

  await cek("setoran tidak ditemukan 404", async () => {
    try {
      await setoranService.detailSetoran(new mongoose.Types.ObjectId(), { role: "admin" });
      throw new Error("seharusnya ditolak");
    } catch (error) {
      harus(error.statusCode === 404, `status ${error.statusCode} bukan 404`);
    }
  });

  console.log("\nDetail pengguna");

  await cek("detail pengguna: petugas hanya melihat nasabah, tanpa field sensitif", async () => {
    const userService = require("../services/userService");
    const admin = await User.create({ nama: "Admin RW", email: "admin@mail.com", password: "hash", role: "admin" });
    const olehPetugas = { id: petugas._id, role: "petugas" };
    const kode = async (pembuat, id) => {
      try {
        await userService.detailUser(pembuat, id);
        return 200;
      } catch (error) {
        return error.statusCode;
      }
    };

    const hasil = await userService.detailUser(olehPetugas, String(nasabah._id));
    harus(hasil.nama === "Budi Santoso" && hasil.email === "budi@mail.com", "nama atau email salah");
    harus(hasil.status === "aktif", `status ${hasil.status} bukan aktif`);
    harus(Object.keys(hasil).sort().join(",") === "_id,email,nama,status", `field berlebih: ${Object.keys(hasil)}`);
    harus((await kode(olehPetugas, String(admin._id))) === 403, "petugas membuka admin tidak 403");
    harus((await kode(olehPetugas, String(petugas._id))) === 403, "petugas membuka petugas tidak 403");
    harus((await kode({ id: admin._id, role: "admin" }, String(petugas._id))) === 200, "admin ditolak");
    harus((await kode(olehPetugas, "bukan-objectid")) === 400, "ID tidak valid bukan 400");
    harus((await kode(olehPetugas, String(new mongoose.Types.ObjectId()))) === 404, "tidak ditemukan bukan 404");
  });

  console.log("\nSaldo nasabah untuk petugas");

  await cek("saldo nasabah menyertakan saldo tersedia dan tertahan", async () => {
    const nasabahService = require("../services/nasabahService");
    const Penarikan = require("../models/Penarikan");
    const saldo = (await User.findById(nasabah._id)).saldo;
    await Penarikan.create([
      { nasabah: nasabah._id, jumlah: 1000, metode: "tunai", status: "diajukan" },
      { nasabah: nasabah._id, jumlah: 500, metode: "tunai", status: "diajukan" },
      { nasabah: nasabah._id, jumlah: 700, metode: "tunai", status: "disetujui" },
    ]);

    const hasil = await nasabahService.saldoNasabah(String(nasabah._id));
    harus(hasil.nasabah === String(nasabah._id), "field nasabah berubah");
    harus(hasil.saldo === saldo, `saldo ${hasil.saldo} bukan ${saldo}`);
    harus(hasil.saldoTertahan === 1500, `saldoTertahan ${hasil.saldoTertahan} bukan 1500`);
    harus(hasil.saldoTersedia === saldo - 1500, `saldoTersedia ${hasil.saldoTersedia} bukan ${saldo - 1500}`);

    const kode = async (id) => {
      try {
        await nasabahService.saldoNasabah(id);
        return 200;
      } catch (error) {
        return error.statusCode;
      }
    };
    harus((await kode("bukan-objectid")) === 400, "ID tidak valid bukan 400");
    harus((await kode(String(new mongoose.Types.ObjectId()))) === 404, "tidak ditemukan bukan 404");
    harus((await kode(String(petugas._id))) === 404, "akun petugas tidak 404");
  });

  console.log("\nKode status endpoint penarikan");

  {
    const express = require("express");
    const jwt = require("jsonwebtoken");
    const Penarikan = require("../models/Penarikan");
    const penarikanService = require("../services/penarikanService");
    const AppError = require("../utils/AppError");

    process.env.JWT_SECRET = process.env.JWT_SECRET || "rahasia-uji-lokal";
    const app = express();
    app.use(express.json());
    app.use("/penarikan", require("../controllers/penarikanController"));
    const server = app.listen(0);
    const alamat = `http://127.0.0.1:${server.address().port}/penarikan`;

    const token = (user) => jwt.sign({ id: String(user._id), role: user.role }, process.env.JWT_SECRET);
    const tokenNasabah = token(nasabah);
    const tokenPetugas = token(petugas);

    const panggil = async (metode, jalur, tokenPengguna, body) => {
      const res = await fetch(`${alamat}${jalur}`, {
        method: metode,
        headers: { Authorization: `Bearer ${tokenPengguna}`, "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      return { status: res.status, data: await res.json() };
    };

    const idAcak = String(new mongoose.Types.ObjectId());
    const [diajukan, selesai] = await Penarikan.create([
      { nasabah: nasabah._id, jumlah: 100, metode: "tunai", status: "diajukan" },
      { nasabah: nasabah._id, jumlah: 100, metode: "tunai", status: "selesai" },
    ]);

    await cek("ajukan melebihi saldo tersedia 400 dengan pesan server", async () => {
      const h = await panggil("POST", "/ajukan", tokenNasabah, { jumlah: 999999999, metode: "tunai" });
      harus(h.status === 400, `status ${h.status} bukan 400`);
      harus(h.data.message === "Saldo tersedia tidak mencukupi untuk penarikan ini", "pesan berubah");
    });

    await cek("ajukan dengan metode tidak dikenal 400", async () => {
      const h = await panggil("POST", "/ajukan", tokenNasabah, { jumlah: 100, metode: "transfer" });
      harus(h.status === 400, `status ${h.status} bukan 400`);
    });

    await cek("filter status tidak dikenal 400", async () => {
      const h = await panggil("GET", "/?status=entah", tokenPetugas);
      harus(h.status === 400, `status ${h.status} bukan 400`);
    });

    await cek("nasabah membuka endpoint petugas 403", async () => {
      const h = await panggil("GET", "/", tokenNasabah);
      harus(h.status === 403, `status ${h.status} bukan 403`);
      const p = await panggil("PATCH", `/${diajukan._id}/proses`, tokenNasabah, { keputusan: "setuju" });
      harus(p.status === 403, `proses oleh nasabah ${p.status} bukan 403`);
      const s = await panggil("PATCH", `/${diajukan._id}/selesai`, tokenNasabah, {});
      harus(s.status === 403, `selesai oleh nasabah ${s.status} bukan 403`);
    });

    await cek("ID penarikan tidak valid 400", async () => {
      const p = await panggil("PATCH", "/bukan-id/proses", tokenPetugas, { keputusan: "setuju" });
      harus(p.status === 400, `proses ${p.status} bukan 400`);
      const s = await panggil("PATCH", "/bukan-id/selesai", tokenPetugas, {});
      harus(s.status === 400, `selesai ${s.status} bukan 400`);
    });

    await cek("tolak tanpa alasan 400", async () => {
      const h = await panggil("PATCH", `/${diajukan._id}/proses`, tokenPetugas, { keputusan: "tolak" });
      harus(h.status === 400, `status ${h.status} bukan 400`);
    });

    await cek("penarikan tidak ditemukan 404", async () => {
      const p = await panggil("PATCH", `/${idAcak}/proses`, tokenPetugas, { keputusan: "setuju" });
      harus(p.status === 404, `proses ${p.status} bukan 404`);
      const s = await panggil("PATCH", `/${idAcak}/selesai`, tokenPetugas, {});
      harus(s.status === 404, `selesai ${s.status} bukan 404`);
    });

    await cek("status tidak sesuai 409", async () => {
      const p = await panggil("PATCH", `/${selesai._id}/proses`, tokenPetugas, { keputusan: "setuju" });
      harus(p.status === 409, `proses penarikan selesai ${p.status} bukan 409`);
      const s = await panggil("PATCH", `/${diajukan._id}/selesai`, tokenPetugas, {});
      harus(s.status === 409, `selesai penarikan diajukan ${s.status} bukan 409`);
    });

    await cek("galat tak terduga 500 tanpa membocorkan detail", async () => {
      const asli = penarikanService.getSaldoNasabah;
      const logAsli = console.error;
      const log = [];
      console.error = (...isi) => log.push(isi);
      try {
        penarikanService.getSaldoNasabah = async () => {
          throw new Error("MongoNetworkError: detail-internal");
        };
        const a = await panggil("GET", "/saldo", tokenNasabah);
        penarikanService.getSaldoNasabah = async () => {
          throw new AppError("Model User belum terdaftar", 500);
        };
        const b = await panggil("GET", "/saldo", tokenNasabah);
        harus(a.status === 500 && b.status === 500, `status ${a.status}/${b.status} bukan 500`);
        harus(a.data.message === "Terjadi kesalahan pada server", "pesan 500 bukan pesan umum");
        harus(!JSON.stringify([a.data, b.data]).includes("detail-internal"), "detail internal bocor");
        harus(!JSON.stringify(b.data).includes("Model User"), "pesan AppError 500 bocor");
        harus(log.length === 2, "galat tidak dicatat di server");
      } finally {
        penarikanService.getSaldoNasabah = asli;
        console.error = logAsli;
      }
    });

    await cek("alur normal tetap 200", async () => {
      const h = await panggil("PATCH", `/${diajukan._id}/proses`, tokenPetugas, { keputusan: "setuju" });
      harus(h.status === 200, `status ${h.status} bukan 200`);
      harus(h.data.data.status === "disetujui", "status bukan disetujui");
    });

    await cek("daftar menyertakan saldoNasabah tersedia dan dikonfirmasiOleh", async () => {
      const lain = await User.create({ nama: "Rina Lain", email: "rina@mail.com", password: "hash", role: "nasabah", saldo: 5000 });
      await Penarikan.create([
        { nasabah: lain._id, jumlah: 1200, metode: "tunai", status: "diajukan" },
        { nasabah: lain._id, jumlah: 800, metode: "tunai", status: "diajukan" },
        {
          nasabah: lain._id,
          jumlah: 300,
          metode: "tunai",
          status: "selesai",
          diprosesOleh: petugas._id,
          dikonfirmasiOleh: petugas._id,
          dikonfirmasiPada: new Date(),
        },
      ]);

      const segar = await User.findById(nasabah._id).select("saldo");
      const tahanBudi = (await Penarikan.find({ nasabah: nasabah._id, status: "diajukan" })).reduce((a, p) => a + p.jumlah, 0);
      const harapan = { [String(nasabah._id)]: segar.saldo - tahanBudi, [String(lain._id)]: 5000 - 2000 };

      const h = await panggil("GET", "/?status=semua&limit=100", tokenPetugas);
      harus(h.status === 200, `status ${h.status} bukan 200`);
      harus(h.data.data.length > 0, "daftar kosong");
      for (const p of h.data.data) {
        harus(p.saldoNasabah === harapan[String(p.nasabah._id)], `saldoNasabah ${p.saldoNasabah} untuk ${p.nasabah.nama} salah`);
      }
      const dikonfirmasi = h.data.data.find((p) => String(p.nasabah._id) === String(lain._id) && p.status === "selesai");
      harus(dikonfirmasi.dikonfirmasiOleh && dikonfirmasi.dikonfirmasiOleh.nama === "Siti Petugas", "dikonfirmasiOleh tidak dipopulasi");
      harus(dikonfirmasi.dikonfirmasiOleh.email === undefined, "dikonfirmasiOleh membocorkan kolom selain nama");
      harus(h.data.paginasi && h.data.paginasi.total === h.data.data.length, "paginasi berubah");

      const kosong = await panggil("GET", "/?status=ditolak", tokenPetugas);
      harus(kosong.status === 200 && Array.isArray(kosong.data.data), "daftar kosong gagal");
    });

    await new Promise((selesaiTutup) => server.close(selesaiTutup));
  }

  console.log(`\nHasil: ${lulus} lulus, ${gagal} gagal\n`);

  await mongoose.disconnect();
  await replset.stop();
  process.exit(gagal === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
