import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createAdminManual = async () => {
  try {
    console.log('?? Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('? Conectado a MongoDB');

    // Definir el esquema directamente por si el modelo no carga
    const adminSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      isActive: Boolean,
      lastLogin: Date,
      createdAt: Date
    });

    const Admin = mongoose.model('Admin', adminSchema);

    // Verificar si ya existe
    const existingAdmin = await Admin.findOne({ email: 'admin@garlycorporations.com' });
    
    if (existingAdmin) {
      console.log('??  El administrador ya existe');
      console.log('?? Email:', existingAdmin.email);
      console.log('?? ID:', existingAdmin._id);
      
      // Verificar la contrasena
      const isPasswordValid = await bcrypt.compare('admin123', existingAdmin.password);
      console.log('?? Contrasena "admin123" valida:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('?? Probando a recrear el administrador...');
        await Admin.deleteOne({ email: 'admin@garlycorporations.com' });
      } else {
        process.exit(0);
      }
    }

    // Crear administrador con contrasena encriptada manualmente
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
    console.log('? Administrador creado exitosamente');
    console.log('?? Email: admin@garlycorporations.com');
    console.log('?? Contrasena: admin123');
    console.log('?? Contrasena encriptada correctamente');

  } catch (error) {
    console.error('? Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('?? Conexion cerrada');
  }
};

createAdminManual();
