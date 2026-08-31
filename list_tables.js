const { Client } = require("pg");

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  });

  try {
    await client.connect();
    const res = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname='public'",
    );
    console.log(res.rows.map((r) => r.tablename).join(", "));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
