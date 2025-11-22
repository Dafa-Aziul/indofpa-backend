import prisma from "../config/prisma.js";

export const logLogin = async (userId, ip, userAgent) => {
  try {
    await prisma.logAktivitas.create({
      data: {
        userId,
        aksi: "LOGIN",
        keterangan: `IP: ${ip} | User-Agent: ${userAgent}`,
      },
    });
  } catch (error) {
    console.error("❌ Gagal menyimpan log login:", error.message);
  }
};

export const logLogout = async (userId, ip, userAgent) => {
  try {
    await prisma.logAktivitas.create({
      data: {
        userId,
        aksi: "LOGOUT",
        keterangan: `IP: ${ip} | User-Agent: ${userAgent}`,
      },
    });
  } catch (error) {
    console.error("❌ Gagal menyimpan log logout:", error.message);
  }
};
