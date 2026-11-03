import 'dotenv/config';
import pg from 'pg';
import { databaseOptions } from './database.config.js';

// One bounded pool per Render instance; transactions must use pool.connect().
export const pool = new pg.Pool(databaseOptions());
pool.on('error', () => console.error('Se perdió una conexión inactiva con la base de datos.'));
