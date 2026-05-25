const db = require('../src/config/database');

(async () => {
  try {
    const tenantQuery = `SELECT id, name, slug, address, phone, whatsapp_number FROM tenants WHERE name ILIKE '%traviatta%' OR slug ILIKE '%traviatta%' LIMIT 10`;
    const tenantRes = await db.readQuery(tenantQuery);
    console.log('tenants', JSON.stringify(tenantRes.rows, null, 2));

    const branchQuery = `SELECT id, name, address, phone, whatsapp_number, tenant_id FROM branches WHERE name ILIKE '%traviatta%' OR address ILIKE '%traviatta%' LIMIT 10`;
    const branchRes = await db.readQuery(branchQuery);
    console.log('branches', JSON.stringify(branchRes.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await db.closeConnections();
  }
})();
