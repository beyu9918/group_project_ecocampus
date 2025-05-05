import postgres from 'postgres';

// Connect using a connection string that matches your Docker setup
const sql = postgres('postgres://admin:admin@localhost:5432/mydb');

export default sql;