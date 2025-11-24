require('dotenv').config(); // Esto es importante
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log de variables de entorno (para debug)
console.log('🔧 Variables de entorno:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Configurada' : '❌ No configurada');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('PORT:', process.env.PORT);

// Conectar a MongoDB si la variable existe
if (process.env.MONGODB_URI) {
  console.log('🔄 Conectando a MongoDB Atlas...');
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ Conectado a MongoDB Atlas exitosamente!');
  })
  .catch((error) => {
    console.log('❌ Error conectando a MongoDB:', error.message);
    console.log('💡 Verifica tu string de conexión en MongoDB Atlas');
  });
} else {
  console.log('🔧 Modo offline - MongoDB URI no configurado');
}

// Health check mejorado
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({ 
    status: 'OK', 
    message: 'GarlyCorporations API is running!',
    mode: process.env.MONGODB_URI ? 'production' : 'offline',
    mongoDB: mongoStatus,
    timestamp: new Date().toISOString()
  });
});

// Auth route básica para producción
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@garlycorporations.com' && password === 'admin123') {
    res.json({
      success: true,
      token: 'jwt-token-' + Date.now(),
      admin: {
        name: 'Administrador Principal',
        email: 'admin@garlycorporations.com',
        role: 'superadmin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciales incorrectas'
    });
  }
});

// Verificar token
app.get('/api/auth/verify', (req, res) => {
  res.json({
    success: true,
    admin: {
      name: 'Administrador Principal',
      email: 'admin@garlycorporations.com',
      role: 'superadmin'
    }
  });
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend funcionando correctamente',
    environment: process.env.NODE_ENV || 'development',
    mongoConnected: mongoose.connection.readyState === 1
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ MongoDB: ${process.env.MONGODB_URI ? 'Configurado' : 'No configurado'}`);
  console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
});
