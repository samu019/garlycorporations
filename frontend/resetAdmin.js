import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const Admin = mongoose.model('Admin', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String
    }));

    // Eliminar el administrador existente
    await Admin.deleteOne({ email: 'admin@garlycorporations.com' });
    
    // Crear nuevo administrador con contrasena correcta
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = new Admin({
      name: 'Administrador Principal',
      email: 'admin@garlycorporations.com',
      password: hashedPassword,
      role: 'superadmin',
      isActive: true,
      createdAt: new Date()
    });

    await admin.save();
    
    console.log('? ADMINISTRADOR RESETEADO EXITOSAMENTE');
    console.log('?? Email: admin@garlycorporations.com');
    console.log('?? Contrasena: admin123');
    console.log('?? Contrasena encriptada correctamente');

    // Verificar que funciona
    const isValid = await bcrypt.compare('admin123', admin.password);
    console.log('? Verificacion de contrasena:', isValid);

  } catch (error) {
    console.error('? Error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

resetAdmin();
