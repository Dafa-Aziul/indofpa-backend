import app from "./src/app.js";
import dotenv from "dotenv";
import os from "os";

dotenv.config();

const PORT = process.env.PORT || 5000;

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
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
  console.log("==========================================");
});
