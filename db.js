import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',
    host: 'host.docker.internal',  
    database: 'eco_campus',
    password: 'password',
    port: 5432,
  });

export const query = (text, params) => pool.query(text, params);