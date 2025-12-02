import { generateKuesionerExcelService } from "../services/exportKuesionerService.js";

export const exportKuesionerExcel = async (req, res, next) => {
  try {
    const workbook = await generateKuesionerExcelService(req.params.kuesionerId);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="kuesioner_${req.params.kuesionerId}.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};
