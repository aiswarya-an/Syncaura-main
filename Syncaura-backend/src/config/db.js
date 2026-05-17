import pkg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect()
  .then(() => console.log("PostgreSQL Connected"))
  .catch((err) => console.error("PostgreSQL Connection Error:", err));

export const initDB = async () => {
  try {
    const initScriptPath = path.join(__dirname, "init.sql");
    const initScript = fs.readFileSync(initScriptPath, "utf8");

    await pool.query(initScript);

    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
};

export default pool;