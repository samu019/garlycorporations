import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const diagnoseLogin = async () => {
  try {
    console.log('?? DIAGNOSTICO DE LOGIN');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('? Conectado a MongoDB');

    // Verificar el administrador
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
    console.log('   ?? Email:', admin.email);
    console.log('   ?? Contrasena hash:', admin.password.substring(0, 30) + '...');
    console.log('   ?? Nombre:', admin.name);
    
    // Probar contrasena
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, admin.password);
    console.log('   ?? Contrasena "admin123" valida:', isValid);
    
    if (!isValid) {
      console.log('   ?? Probando recrear administrador...');
      
      // Recrear administrador
      const salt = await bcrypt.genSalt(10);
      const newHashedPassword = await bcrypt.hash(testPassword, salt);
      
      await Admin.deleteOne({ email: 'admin@garlycorporations.com' });
      
      const newAdmin = new Admin({
        name: 'Administrador Principal',
        email: 'admin@garlycorporations.com',
        password: newHashedPassword,
        role: 'superadmin'
      });
      
      await newAdmin.save();
      console.log('   ? Administrador recreado');
    }

  } catch (error) {
    console.error('? Error en diagnostico:', error);
  } finally {
    await mongoose.connection.close();
  }
};

diagnoseLogin();
