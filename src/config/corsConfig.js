// src/config/corsConfig.js

export const corsOptions = {
  origin: (origin, callback) => {
    const allowed = [
      process.env.CLIENT_URL,     // frontend utama
      process.env.APP_PUBLIC_URL, // jika backend punya domain sendiri
    ].filter(Boolean);

    // Jika request dari Postman / server-side → tidak ada origin → izinkan
    if (!origin) return callback(null, true);

    // Izinkan hanya origin yang ada di whitelist
    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin} not allowed`));
    }
  },

  credentials: true, // penting untuk cookie refresh token
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
