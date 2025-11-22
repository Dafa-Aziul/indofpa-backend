import { error } from "../utils/response.js";
import prisma from "../config/prisma.js";

export const validateCreateKuesioner = ( req, res, next, ) => {
    const { judul, kategoriId } = req.body;

    let errors = {};
    
    if(!judul) errors.judul = "judul wajib diisi";
    if(!kategoriId) errors.kategoriId = "Kategori wajib dipilih";

    if (Object.keys(errors).length > 0) {
        return error(res, {
            messege: "Validasi gagal",
            errors,
            code : 422,
        });
    }

    next();
}   

export const validateUpdateKuesioner = (req, res, next) => {
  const allowedFields = [
    "judul",
    "tujuan",
    "manfaat",
    "status",
    "kategoriId"
  ];

  const errors = {};
  const bodyKeys = Object.keys(req.body);

  // ❌ Tidak ada data yang dikirim
  if (bodyKeys.length === 0) {
    return error(res, {
      message: "Tidak ada data yang dikirim",
      code: 422
    });
  }

  // ❌ Field tidak diizinkan
  for (const key of bodyKeys) {
    if (!allowedFields.includes(key)) {
      errors[key] = `Field '${key}' tidak diizinkan untuk diupdate`;
    }
  }

  // ❌ Validasi khusus field tertentu
  if (req.body.judul !== undefined && req.body.judul.trim() === "") {
    errors.judul = "Judul tidak boleh kosong";
  }

  if (req.body.status !== undefined) {
    const allowedStatus = ["Draft", "Publish", "Arsip"];
    if (!allowedStatus.includes(req.body.status)) {
      errors.status = "Status tidak valid";
    }
  }

  if (req.body.kategoriId !== undefined) {
    if (isNaN(req.body.kategoriId)) {
      errors.kategoriId = "Kategori harus berupa angka";
    }
  }

  // ❌ Jika ada error, return
  if (Object.keys(errors).length > 0) {
    return error(res, {
      message: "Validasi gagal",
      errors,
      code: 422
    });
  }

  next();
};


export const validateDeleteKuesioner = async (req, res, next) => {
  const { id } = req.params;

  // 🔹 ID harus ada
  if (!id) {
    return error(res, {
      message: "ID kuesioner wajib diberikan",
      code: 422,
    });
  }

  // 🔹 ID harus angka
  if (isNaN(id)) {
    return error(res, {
      message: "ID kuesioner harus berupa angka",
      code: 422,
    });
  }

  // 🔹 Cek apakah kuesioner ada
  const kuesioner = await prisma.kuesioner.findUnique({
    where: { kuesionerId: Number(id) },
  });

  if (!kuesioner) {
    return error(res, {
      message: "Kuesioner tidak ditemukan",
      code: 404,
    });
  }

  // 🔹 Cek hanya boleh delete kalau status Draft
  if (kuesioner.status !== "Draft") {
    return error(res, {
      message: "Kuesioner hanya bisa dihapus jika status Draft",
      errors: { status: `Status sekarang: ${kuesioner.status}` },
      code: 403,
    });
  }

  next();
};