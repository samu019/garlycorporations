require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Configuración de CORS para permitir credenciales
const corsOptions = {
  origin: 'https://garlycorporations-frontend.onrender.com',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Log de variables de entorno
console.log('🔧 Variables de entorno:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Configurada' : '❌ No configurada');

// Conexión a MongoDB
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
  });
}

// Health check
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

// Auth routes
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
});
