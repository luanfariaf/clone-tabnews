import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const version = await database.query("SHOW server_version;");
  const databaseName = process.env.POSTGRES_DB;
  const result = await database.query({
    text: `
      SELECT
      (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') AS max_connections,
      (SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1) AS opened_connections`,
    values: [databaseName]
  });

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: version.rows[0].server_version,
        max_connections: result.rows[0].max_connections,
        opened_connections: result.rows[0].opened_connections,
      },
    },
  });
}

export default status;
