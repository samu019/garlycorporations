import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const verifyAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const Admin = mongoose.model('Admin', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String
    }));

    const admin = await Admin.findOne({ email: 'admin@garlycorporations.com' });
    
    if (!admin) {
      console.log('? No se encontro el administrador');
      return;
    }

    console.log('? Administrador encontrado:');
    console.log('?? Email:', admin.email);
    console.log('?? Nombre:', admin.name);
    console.log('?? Rol:', admin.role);
    
    // Verificar contrasena
    const isValid = await bcrypt.compare('admin123', admin.password);
    console.log('?? Contrasena "admin123" valida:', isValid);
    
    if (!isValid) {
      console.log('? LA CONTRASENA NO ES VALIDA');
      console.log('?? Vamos a corregirla...');
      
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash('admin123', salt);
      await admin.save();
      console.log('? Contrasena corregida');
    }

  } catch (error) {
    console.error('? Error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

verifyAdmin();
