// ===============================================
//  Excel Style Utilities (Centralized Styling)
// ===============================================

export const headerStyle = {
  font: { bold: true },
  alignment: { horizontal: "center", vertical: "middle" },
  border: {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  },
  fill: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE8E8E8" }, // abu-abu muda
  },
};

export const cellBorder = {
  top: { style: "thin" },
  bottom: { style: "thin" },
  left: { style: "thin" },
  right: { style: "thin" },
};

// Center text style
export const centerText = {
  alignment: { horizontal: "center", vertical: "middle" },
};

// Bold text only
export const boldText = {
  font: { bold: true },
};

// Helper: style all cells in a row
export const styleRow = (row, style) => {
  row.eachCell((c) => {
    Object.assign(c, { style });
  });
};

// Helper: apply border to all cells in a row
export const applyBorder = (row) => {
  row.eachCell((c) => {
    c.border = cellBorder;
  });
};

// Helper: auto width
export const autosizeColumns = (sheet) => {
  sheet.columns.forEach((column) => {
    let maxLength = 15;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const len = cell.value ? cell.value.toString().length : 0;
      if (len > maxLength) maxLength = len;
    });
    column.width = maxLength + 5;
  });
};
