require('dotenv').config();
const { Client } = require('pg');

async function seedCategory() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  
const categories = [
    { name: 'Vestidos', slug: 'vestidos', desc: 'Vestidos para toda ocasión' },
    { name: 'Casacas', slug: 'casacas', desc: 'Casacas y abrigos' },
    { name: 'Pantalones', slug: 'pantalones', desc: 'Pantalones, jeans y de vestir' },
    { name: 'Faldas', slug: 'faldas', desc: 'Faldas cortas, midi y largas' },
    { name: 'Tops', slug: 'tops', desc: 'Tops y polos' },
    { name: 'Blusas', slug: 'blusas', desc: 'Blusas casuales y elegantes' },
    { name: 'Accesorios', slug: 'accesorios', desc: 'Complementos y accesorios' }
  ];

  try {
    for (const cat of categories) {
      const id = require('crypto').randomUUID();
      await client.query(`
        INSERT INTO "category" (id, name, slug, description, "createdAt", "updatedAt") 
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (name) DO NOTHING
      `, [id, cat.name, cat.slug, cat.desc]);
      console.log(`Category "${cat.name}" seeded successfully.`);
    }
  } catch (err) {
    console.error('Error seeding categories:', err);
  } finally {
    await client.end();
  }
}

seedCategory();
