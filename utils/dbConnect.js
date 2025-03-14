// utils/dbConnect.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const connectToDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: "149.28.34.53",
      user: "acadcbba_vins",
      password: "Vins8039368",
      database: "acadcbba_esamdb",
    });
    console.log('✅ Conexión exitosa a MySQL');
    return connection;
  } catch (error) {
    console.error('❌ Error de conexión a MySQL:', error.message);
    throw error; // Propaga el error para manejo global
  }
};