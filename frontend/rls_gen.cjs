const fs = require('fs');
const txt = fs.readFileSync('db_dump.sql', 'utf16le');
const lines = txt.split('\n').filter(l => l.includes('CREATE POLICY') && (l.includes('has_role') || l.includes('has_any_role')));
const migrationLines = [];
lines.forEach(l => {
  const match = l.match(/CREATE POLICY \"([^\"]+)\" ON \"public\"\.\"([^\"]+)\"/);
  if (match) {
    migrationLines.push(`DROP POLICY IF EXISTS "${match[1]}" ON "public"."${match[2]}";`);
  }
});
const tables = [...new Set(lines.map(l => {
  const match = l.match(/ON \"public\"\.\"([^\"]+)\"/);
  return match ? match[1] : null;
}).filter(Boolean))];

tables.forEach(t => {
  if (!['roles', 'user_roles', 'profiles', 'audit_logs', 'notifications'].includes(t)) {
    migrationLines.push(`CREATE POLICY "Enable all operations for authenticated users" ON "public"."${t}" FOR ALL TO authenticated USING (true) WITH CHECK (true);`);
  }
});
fs.writeFileSync('rls_migration.sql', migrationLines.join('\n'));
