// config/default.js
export default {
  port: parseInt(process.env.PORT, 10) || 3000,
  db: {
    host: process.env.PG_HOST || 'host.docker.internal',
    port:     parseInt(process.env.PG_PORT, 10)     || 5432,
    database: process.env.PG_DATABASE || 'postgres',
    username: process.env.PG_USER     || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    dialect:  'postgres'
  }
};
