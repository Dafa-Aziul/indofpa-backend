import dotenv from "dotenv";
dotenv.config();

import "./src/config/loadEnv.js";
import app from "./src/app.js";
import os from "os";

const PORT = process.env.PORT || 5000;

// Global error handling - Penting untuk mencegah aplikasi "hang" tanpa sebab
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
  // Di production, sangat disarankan untuk exit agar PM2 bisa me-restart proses
  process.exit(1);
});

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "0.0.0.0";
}

async function startServer() {
  try {
    // Jalankan server
    const server = app.listen(PORT, () => {
      const ip = getLocalIP();
      console.log("==========================================");
      console.log("🚀 Server Running");
      console.log(`➡ Local API:   http://localhost:${PORT}`);
      console.log(`➡ Network API: http://${ip}:${PORT}`);
      console.log("------------------------------------------");
      console.log("🌱 MODE:", process.env.NODE_ENV || "development");
      console.log("==========================================");
    });

    // Menangkap error jika port macet atau masalah network lainnya
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} sudah digunakan oleh proses lain.`);
      } else {
        console.error("❌ Server Error:", err);
      }
      process.exit(1); // Berhenti agar PM2 tahu aplikasi harus di-restart
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
