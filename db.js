import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();


const sql = postgres({
  host: process.env.DB_HOST || 'host.docker.internal',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mydb',
  username: process.env.DB_USER || 'myuser',
  password: process.env.DB_PASS || 'mypassword',
  ssl: false,
});

export default sql;