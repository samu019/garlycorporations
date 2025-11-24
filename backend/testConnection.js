import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('? Conexion a MongoDB exitosa');
    
    // Verificar las bases de datos
    const dbs = await mongoose.connection.db.admin().listDatabases();
    console.log('?? Bases de datos disponibles:', dbs.databases.map(db => db.name));
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('? Error conectando a MongoDB:', error.message);
  }
};

testConnection();
