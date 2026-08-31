import pg from 'pg';
import 'dotenv/config';

const localPool = new pg.Pool({
  connectionString: 'postgresql://postgres:ZAanthony200399@localhost:5432/tienda_ropa?schema=public'
});

const supabasePool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrateData() {
  console.log('Iniciando migración de datos locales a Supabase...');
  try {
    // 1. Get all local categories
    const localCategories = await localPool.query('SELECT * FROM "category"');
    // 2. Get all Supabase categories
    const supabaseCategories = await supabasePool.query('SELECT * FROM "category"');
    
    // Map local category ID -> Supabase category ID (by matching name)
    const categoryMap = {};
    for (const lc of localCategories.rows) {
      const match = supabaseCategories.rows.find(sc => sc.name === lc.name);
      if (match) {
        categoryMap[lc.id] = match.id;
      }
    }

    // 3. Migrate Products
    const localProducts = await localPool.query('SELECT * FROM "product"');
    console.log(`Encontrados ${localProducts.rows.length} productos locales.`);

    for (const p of localProducts.rows) {
      const exists = await supabasePool.query('SELECT id FROM "product" WHERE name = $1', [p.name]);
      if (exists.rows.length === 0) {
        // Find new category ID
        const newCategoryId = categoryMap[p.categoryId] || supabaseCategories.rows[0]?.id; // fallback to first category if missing
        
        await supabasePool.query(`
          INSERT INTO "product" (id, name, slug, description, price, "categoryId", images, stock, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [p.id, p.name, p.slug, p.description, p.price, newCategoryId, p.images, p.stock, p.createdAt, p.updatedAt]);
        console.log(`Producto migrado: ${p.name}`);
      } else {
        console.log(`Producto ya existe: ${p.name}`);
      }
    }

    console.log('¡Migración de productos completada!');
  } catch (err) {
    console.error('Error durante la migración:', err);
  } finally {
    localPool.end();
    supabasePool.end();
  }
}

migrateData();
