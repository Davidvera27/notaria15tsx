import sqlite3 from 'sqlite3';
import path from 'path';

// Configuración para el modo verbose (opcional para mostrar logs detallados)
sqlite3.verbose();

// Ruta de la base de datos
const DATABASE_PATH = path.resolve(__dirname, '../config/notaria15tsx.db');

// Conexión a la base de datos
const db = new sqlite3.Database(DATABASE_PATH, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
  }
});

// Exportar la instancia de la base de datos
export default db;
