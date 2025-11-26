require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CONFIGURACIÓN CORS COMPLETA
const corsOptions = {
  origin: [
    'https://garlycorporations-frontend-app.onrender.com',
    'https://garlycorporations-frontend.onrender.com',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// Aplicar CORS a todas las rutas
app.use(cors(corsOptions));

// Manejar preflight requests explícitamente
app.options('*', cors(corsOptions));

app.use(express.json());

// Log de CORS
console.log('🔧 CORS Configurado para:');
console.log('   - https://garlycorporations-frontend-app.onrender.com');
console.log('   - https://garlycorporations-frontend.onrender.com');

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

// Health check con info CORS
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'OK',
    message: 'GarlyCorporations API is running!',
    mode: process.env.MONGODB_URI ? 'production' : 'offline',
    mongoDB: mongoStatus,
    cors: 'enabled',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt from:', req.headers.origin);
  
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

// Mantener el resto de tus rutas igual...
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

app.get('/api/subscribers', (req, res) => {
  res.json({
    success: true,
    subscribers: [],
    total: 0
  });
});

app.post('/api/subscribers', (req, res) => {
  const newSubscriber = {
    _id: 'sub-' + Date.now(),
    ...req.body,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  res.json({
    success: true,
    subscriber: newSubscriber,
    message: 'Suscriptor creado exitosamente'
  });
});

app.get('/api/contracts', (req, res) => {
  res.json({
    success: true,
    contracts: [],
    total: 0
  });
});

app.post('/api/contracts/upload', (req, res) => {
  const newContract = {
    _id: 'contract-' + Date.now(),
    ...req.body,
    uploadDate: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Contrato subido exitosamente',
    contract: newContract
  });
});

app.post('/api/upload/contract', (req, res) => {
  const newContract = {
    _id: 'contract-' + Date.now(),
    ...req.body,
    uploadDate: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Contrato subido exitosamente',
    contract: newContract
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend funcionando correctamente',
    environment: process.env.NODE_ENV || 'development',
    mongoConnected: mongoose.connection.readyState === 1,
    cors: 'enabled'
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔧 CORS configurado para producción`);
  console.log(`🌐 Frontends permitidos:`);
  console.log(`   - https://garlycorporations-frontend-app.onrender.com`);
  console.log(`   - https://garlycorporations-frontend.onrender.com`);
});
