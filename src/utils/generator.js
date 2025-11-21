// Generate random string
export const randomString = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate kode akses untuk kuesioner
export const generateAccessCode = () => {
  return "IN-" + randomString(6);
};

// Generate unique ID (non-database)
export const uniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};
