import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import pool from './config/db.js';

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  try {
    // Verifica conexión a la BD al iniciar
    const conn = await pool.getConnection();
    console.log('✅ Conectado a MySQL correctamente.');
    conn.release();

    app.listen(PORT, () => {
      console.log(`🚀 API escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ No se pudo conectar a la base de datos:', err.message);
    process.exit(1);
  }
}

start();