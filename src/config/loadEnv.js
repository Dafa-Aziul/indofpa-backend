import dotenv from "dotenv";
dotenv.config();

function buildDatabaseURL() {
  const connection = process.env.DB_CONNECTION || "mysql";
  const host = process.env.DB_HOST || "localhost";
  const port = process.env.DB_PORT || "3306";
  const database = process.env.DB_DATABASE || "";
  const user = process.env.DB_USERNAME || "";
  const pass = process.env.DB_PASSWORD || "";

  const encodedPass = encodeURIComponent(pass);

  return `${connection}://${user}:${encodedPass}@${host}:${port}/${database}`;
}

process.env.DATABASE_URL = process.env.DATABASE_URL || buildDatabaseURL();
