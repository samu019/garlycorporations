import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const verifyAdminPassword = async () => {
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
    console.log('?? Contrasena almacenada:', admin.password.substring(0, 20) + '...');
    
    // Probar diferentes contrasenas
    const testPasswords = ['admin123', 'password', '123456', 'admin'];
    
    for (const pwd of testPasswords) {
      const isValid = await bcrypt.compare(pwd, admin.password);
      console.log(`?? "${pwd}" es valida:`, isValid);
      if (isValid) {
        console.log('?? CONTRASENA CORRECTA:', pwd);
        break;
      }
    }

  } catch (error) {
    console.error('? Error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

verifyAdminPassword();
