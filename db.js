import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',
    host: 'host.docker.internal',  // ✅ 改为连接主机
    database: 'eco_campus',
    password: 'password',
    port: 5432,
  });

export const query = (text, params) => pool.query(text, params);