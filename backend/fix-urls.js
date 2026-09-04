import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZAanthony200399@localhost:5432/tienda_ropa?schema=public',
  ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined
});

async function fixUrls() {
  const { rows } = await pool.query('SELECT id, images FROM "product"');
  for (const product of rows) {
    if (product.images && product.images.length > 0) {
      let updated = false;
      const newImages = product.images.map(url => {
        if (url.includes('onrender.comhttps://')) {
          updated = true;
          return 'https://' + url.split('https://')[2];
        }
        return url;
      });
      
      if (updated) {
        await pool.query('UPDATE "product" SET images = $1 WHERE id = $2', [newImages, product.id]);
        console.log(`Fixed product ${product.id}`);
      }
    }
  }
  console.log("Done");
  process.exit(0);
}

fixUrls();
