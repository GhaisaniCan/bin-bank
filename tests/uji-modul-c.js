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
  const pet = await JenisSampah.create({ nama: "Plastik PET", harga_per_kg: 3000 });
  const kardus = await JenisSampah.create({ nama: "Kardus", harga_per_kg: 1500 });

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
    await JenisSampah.findByIdAndUpdate(pet._id, { harga_per_kg: 9999 });
    const lama = await Setoran.findById(setoranPertama._id);
    harus(lama.rincian[0].hargaPerKg === 3000, "setoran lama ikut berubah");
    harus(lama.totalNilai === 9300, "totalNilai lama ikut berubah");
    await JenisSampah.findByIdAndUpdate(pet._id, { harga_per_kg: 3000 });
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

  console.log(`\nHasil: ${lulus} lulus, ${gagal} gagal\n`);

  await mongoose.disconnect();
  await replset.stop();
  process.exit(gagal === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
