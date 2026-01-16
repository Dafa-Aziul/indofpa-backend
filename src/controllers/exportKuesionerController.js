import { generateKuesionerExcelService } from "../services/exportKuesionerService.js";

export const exportKuesionerExcel = async (req, res, next) => {
  try {
    const { kuesionerId } = req.params;

    const { workbook, title } = await generateKuesionerExcelService(kuesionerId);

    const now = new Date();
    const date = now.toLocaleDateString("id-ID").replace(/\//g, "-");
    const time = now.getHours().toString().padStart(2, '0') + "." +
      now.getMinutes().toString().padStart(2, '0');

    const safeTitle = title.replace(/[/\\?%*:|"<>]/g, '-').trim();

    const fileName = `Laporan Hasil Responden (${safeTitle}) - ${date} ${time}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    await workbook.xlsx.write(res);

    res.end();

  } catch (err) {
    next(err);
  }
};