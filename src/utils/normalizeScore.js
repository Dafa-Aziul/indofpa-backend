// Normalisasi 1 pertanyaan (skala Likert custom)
export const normalizePerQuestion = (nilai, min = 1, max = 5) => {
  return ((nilai - min) / (max - min)) * 100;
};

// Normalisasi 1 indikator
export const normalizePerIndikator = (total, jumlah, min = 1, max = 5) => {
  return ((total - jumlah * min) / ((max - min) * jumlah)) * 100;
};

// Normalisasi 1 variabel (agregasi dari indikator)
export const normalizePerVariabel = (nilaiArr) => {
  const avg = nilaiArr.reduce((a,b)=>a+b,0) / nilaiArr.length;
  return avg;
};
