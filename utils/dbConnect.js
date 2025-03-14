// utils/dbConnect.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config(); // Carga las variables de entorno desde el archivo .env

export const connectToDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    console.log('✅ Conexión exitosa a MySQL');
    return connection;
  } catch (error) {
    console.error('❌ Error de conexión a MySQL:', error.message);
    throw error; // Propaga el error para manejo global
  }
};
