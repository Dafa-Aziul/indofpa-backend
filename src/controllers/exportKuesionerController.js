import { generateKuesionerExcelService } from "../services/exportKuesionerService.js";

export const exportKuesionerExcel = async (req, res, next) => {
  try {
    const { kuesionerId } = req.params;

    // 1. Ambil data dari service
    const { workbook, title } = await generateKuesionerExcelService(kuesionerId);

    // 2. Format Timestamp: 14-01-2026 01.15
    const now = new Date();
    const date = now.toLocaleDateString("id-ID").replace(/\//g, "-");
    const time = now.getHours().toString().padStart(2, '0') + "." + 
                 now.getMinutes().toString().padStart(2, '0');
    
    // 3. Sanitasi Judul: Hapus karakter ilegal
    const safeTitle = title.replace(/[/\\?%*:|"<>]/g, '-').trim();
    
    // 4. Susun Nama File
    const fileName = `Laporan Hasil Responden (${safeTitle}) - ${date} ${time}.xlsx`;

    // 5. Set Headers (PENTING!)
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    
    // Header agar nama file bisa diunduh dengan benar
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    // ✅ POINT KRUSIAL: Izinkan frontend (Axios/Fetch) membaca header Content-Disposition
    // Tanpa ini, Next.js tidak akan pernah tahu nama filenya apa
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    // 6. Tulis file ke stream response
    await workbook.xlsx.write(res);
    
    // Selesaikan response
    res.end();

  } catch (err) {
    next(err);
  }
};