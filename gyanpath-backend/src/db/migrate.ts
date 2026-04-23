import { Pool } from 'pg';
import { config } from '../config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Run database migrations
 */
async function runMigrations() {
  const pool = new Pool({
    connectionString: config.database.url,
  });

  try {
    // Create migrations table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Get applied migrations
    const { rows: appliedMigrations } = await pool.query(
      'SELECT version FROM schema_migrations'
    );

    const appliedVersions = new Set(appliedMigrations.map((r) => r.version));

    // Get migration files
    const migrationsDir = path.join(__dirname, '../../migrations');
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    // Run pending migrations
    for (const file of migrationFiles) {
      const version = file.replace('.sql', '');

      if (appliedVersions.has(version)) {
        continue;
      }

      console.log(`Applying migration: ${version}`);

      const migrationSql = fs.readFileSync(
        path.join(migrationsDir, file),
        'utf-8'
      );

      await pool.query('BEGIN');

      try {
        await pool.query(migrationSql);
        await pool.query(
          'INSERT INTO schema_migrations (version) VALUES ($1)',
          [version]
        );
        await pool.query('COMMIT');
        console.log(`✓ Migration ${version} applied`);
      } catch (error) {
        await pool.query('ROLLBACK');
        console.error(`✗ Migration ${version} failed:`, error);
        throw error;
      }
    }

    console.log('All migrations applied successfully');
  } finally {
    await pool.end();
  }
}

runMigrations().catch(console.error);
