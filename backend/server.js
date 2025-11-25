require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log detallado para debug
console.log('=== 🚀 INICIANDO BACKEND ===');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ CONFIGURADA' : '❌ NO CONFIGURADA');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Datos en memoria para funcionar siempre
let subscribers = [];
let contracts = [];

// Intentar conectar a MongoDB solo si la URI es válida
if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb+srv://')) {
  console.log('🔄 Intentando conectar a MongoDB Atlas...');
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ CONECTADO A MONGODB ATLAS!');
    // Aquí cargaríamos los modelos reales
  })
  .catch((error) => {
    console.log('❌ Error MongoDB:', error.message);
    console.log('💡 Usando base de datos en memoria');
  });
} else {
  console.log('🔧 Usando base de datos en memoria (MongoDB no configurado)');
  
  // Datos de ejemplo
  subscribers = [
    {
      _id: '1',
      name: 'Carlos Benjamin',
      email: 'mbaesonojuanbenjaminmba@gmail.com',
      country: 'España',
      paymentMethod: 'paypal',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      name: 'Ana Rodríguez',
      email: 'ana@ejemplo.com',
      country: 'México',
      paymentMethod: 'credit_card',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ];
}

// Health check mejorado
app.get('/api/health', (req, res) => {
  const mongoConnected = mongoose.connection.readyState === 1;
  
  res.json({ 
    status: 'OK', 
    message: 'GarlyCorporations API is running!',
    mode: mongoConnected ? 'production' : 'offline',
    database: mongoConnected ? 'MongoDB Atlas' : 'Memoria',
    subscribersCount: subscribers.length,
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Intento de login:', email);
  
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

// Subscribers routes
app.get('/api/subscribers', (req, res) => {
  res.json({
    success: true,
    subscribers: subscribers
  });
});

app.post('/api/subscribers', (req, res) => {
  const newSubscriber = {
    _id: 'sub-' + Date.now(),
    ...req.body,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  subscribers.push(newSubscriber);
  
  console.log('✅ Nuevo suscriptor creado:', newSubscriber.name);
  
  res.json({ 
    success: true, 
    subscriber: newSubscriber,
    message: 'Suscriptor creado exitosamente'
  });
});

// Contracts routes
app.get('/api/contracts', (req, res) => {
  res.json({
    success: true,
    contracts: contracts
  });
});

app.post('/api/contracts/upload', (req, res) => {
  // Simular upload exitoso
  const newContract = {
    _id: 'contract-' + Date.now(),
    subscriberName: 'Suscriptor Demo',
    originalName: 'contrato.pdf',
    fileType: 'application/pdf',
    uploadDate: new Date().toISOString(),
    fileSize: 1024000
  };
  contracts.push(newContract);
  
  res.json({
    success: true,
    message: 'Contrato subido exitosamente',
    contract: newContract
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`=== 🚀 SERVER INICIADO ===`);
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🌐 URL: https://garlycorporations.onrender.com`);
  console.log(`📊 Health: https://garlycorporations.onrender.com/api/health`);
  console.log(`💾 Database: ${mongoose.connection.readyState === 1 ? 'MongoDB Atlas' : 'Memoria'}`);
});
