import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.NEXT_PUBLIC_DATABASE_HOST,
  user: process.env.NEXT_PUBLIC_DATABASE_USER,
  password: process.env.NEXT_PUBLIC_DATABASE_PASSWORD,
  database: process.env.NEXT_PUBLIC_DATABASE_NAME,
});

export const query = async (sql, values) => {
  const [results] = await pool.execute(sql, values);
  return results;
};