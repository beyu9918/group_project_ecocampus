import postgres from 'postgres';

const sql = postgres('postgres://admin:admin@172.17.0.2:5432/mydb');

async function test() {
  try {
    const users = await sql`SELECT * FROM users`;
    console.log(users);
  } catch (err) {
    console.error('❌ Query failed:', err);
  }
}

test();