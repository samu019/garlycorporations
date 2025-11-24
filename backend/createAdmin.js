import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const createInitialAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('? Conectado a MongoDB');

    // Verificar si ya existe un administrador
    const existingAdmin = await Admin.findOne({ email: 'admin@garlycorporations.com' });
    
    if (existingAdmin) {
      console.log('??  El administrador ya existe');
      console.log('?? Email: admin@garlycorporations.com');
      console.log('?? Puedes usar las credenciales existentes');
      process.exit(0);
    }

    // Crear administrador inicial
    const admin = new Admin({
      name: 'Administrador Principal',
      email: 'admin@garlycorporations.com',
      password: 'admin123', // Se encriptara automaticamente
      role: 'superadmin'
    });

    await admin.save();
    console.log('? Administrador creado exitosamente');
    console.log('?? Email: admin@garlycorporations.com');
    console.log('?? Contrasena: admin123');
    console.log('??  Cambia esta contrasena despues del primer login!');

  } catch (error) {
    console.error('? Error:', error);
    console.log('?? ?Tienes MongoDB ejecutandose?');
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createInitialAdmin();
