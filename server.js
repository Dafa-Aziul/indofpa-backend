import dotenv from "dotenv";
dotenv.config();

import "./src/config/loadEnv.js";

import app from "./src/app.js";
import os from "os";

const PORT = process.env.PORT || 5000;

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "0.0.0.0";
}

app.listen(PORT, () => {
  const ip = getLocalIP();

  console.log("==========================================");
  console.log("🚀 Server Running");
  console.log(`➡ Local API:   http://localhost:${PORT}/api`);
  console.log(`➡ Network API: http://${ip}:${PORT}/api`);
  console.log("------------------------------------------");
  console.log("🌱 MODE:", process.env.NODE_ENV);
  console.log("==========================================");
});
