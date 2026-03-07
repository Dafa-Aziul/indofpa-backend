export const corsOptions = {
  origin: (origin, callback) => {
    const allowed = [
      process.env.CLIENT_URL, // Pastikan ini https://indofpa.sotvi.org
      process.env.APP_PUBLIC_URL,
    ].filter(Boolean);

    // LOG INI SANGAT PENTING DI PRODUKSI
    console.log("Origin dari Browser:", origin);
    console.log("Daftar URL yang Diizinkan:", allowed);

    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin} not allowed`));
    }
  },

  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
