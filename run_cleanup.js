const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
  });

  try {
    await client.connect();
    const sql = fs.readFileSync(path.join(__dirname, 'cleanup.sql'), 'utf8');
    await client.query(sql);
    console.log('Cleanup executed successfully.');
  } catch (err) {
    console.error('Error executing cleanup:', err);
  } finally {
    await client.end();
  }
}

main();
