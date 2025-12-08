// src/utils/databaseUrl.js
export const buildDatabaseUrl = () => {
  const {
    DB_CONNECTION,
    DB_HOST,
    DB_PORT,
    DB_DATABASE,
    DB_USERNAME,
    DB_PASSWORD
  } = process.env;

  return `${DB_CONNECTION}://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;
};
