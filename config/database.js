import { Sequelize } from 'sequelize';
import envConfig      from './default.js';
const { host, port, database, username, password, dialect } = envConfig.db;

export const sequelize = new Sequelize(database, username, password, {
  host,
  port,
  dialect,
  logging: false,
});

export async function connectDatabase() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('✅ PostgreSQL connected & synced');
  } catch (err) {
    console.error('🚨 DB connection failed:', err);
    process.exit(1);
  }
}