import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testAtlasConnection = async () => {
  try {
    console.log('?? Conectando a MongoDB Atlas...');
    console.log('URI:', process.env.MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://***:***@'));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('? ?CONEXION EXITOSA A MONGODB ATLAS!');
    
    // Verificar las colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('?? Colecciones en la base de datos:');
    collections.forEach(collection => {
      console.log('   -', collection.name);
    });
    
    await mongoose.connection.close();
    console.log('?? Conexion cerrada');
    
  } catch (error) {
    console.error('? ERROR de conexion:', error.message);
    console.log('?? Verifica:');
    console.log('   1. Tu cadena de conexion en .env');
    console.log('   2. Que el usuario tiene permisos');
    console.log('   3. Que tu IP esta en la lista de permitidas');
  }
};

testAtlasConnection();
