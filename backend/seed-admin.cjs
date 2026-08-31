const { Client } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function createAdmin() {
  const client = new Client({
    connectionString: 'postgresql://postgres:ZAanthony200399@localhost:5432/tienda_ropa'
  });
  await client.connect();
  
  const hash = await bcrypt.hash('admin123', 10);
  const id = crypto.randomUUID();
  
  await client.query(`
    INSERT INTO "user" (id, email, password, name, role, "createdAt", "updatedAt") 
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
  `, [id, 'admin@admin.com', hash, 'Admin', 'ADMIN']);
  
  console.log('Admin account created successfully:');
  console.log('Email: admin@admin.com');
  console.log('Password: admin123');
  
  await client.end();
}

createAdmin().catch(console.error);
