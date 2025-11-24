import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('?? Probando conexion corregida...');
    console.log('URI:', process.env.MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://***:***@'));
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('? ?CONEXION EXITOSA!');
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('? Error de conexion:', error.message);
    console.log('?? Posibles soluciones:');
    console.log('   1. Verificar la contrasena del usuario');
    console.log('   2. Verificar que la IP esta en la lista blanca');
    console.log('   3. Probar sin &appName=Cluster0');
  }
};

testConnection();
