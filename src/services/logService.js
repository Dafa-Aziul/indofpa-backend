import prisma from "../config/prisma.js";

// Menyimpan log login user
export const logLogin = async (idUser) => {
  try {
    await prisma.logAktivitas.create({
      data: {
        idUser,
        aksi: "LOGIN",
        keterangan: "Login berhasil",
        // waktu otomatis: prisma schema sudah default now()
      },
    });
  } catch (error) {
    // Jangan hentikan proses login jika log gagal
    console.error("❌ Gagal menyimpan log login:", error.message);
  }
};
export const logLogout = async (idUser) => {
  try {
    await prisma.logAktivitas.create({
      data: {
        idUser,
        aksi: "LOGOUT",
        keterangan: "Logout berhasil",
      },
    });
  } catch (error) {
    console.error("❌ Gagal menyimpan log logout:", error.message);
  }
};
