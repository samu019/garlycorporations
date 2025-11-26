require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Configuración CORS MEJORADA
const corsOptions = {
  origin: [
    'https://garlycorporations-frontend.onrender.com',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Manejar preflight requests explícitamente
app.options('*', cors(corsOptions));

// Log de variables de entorno
console.log('🔧 Variables de entorno:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Configurada' : '❌ No configurada');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

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
    timestamp: new Date().toISOString(),
    cors: 'configured'
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Intento de login recibido:', req.body.email);
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

// Ruta de prueba de conexión
app.get('/api/connection-test', (req, res) => {
  res.json({
    success: true,
    message: 'Conexión al backend exitosa',
    timestamp: new Date().toISOString(),
    frontend: 'https://garlycorporations-frontend.onrender.com'
  });
});

// =============================================
// RUTAS NUEVAS PARA SOPORTAR EL FRONTEND
// =============================================

// Suscriptores - Rutas básicas
app.get('/api/subscribers', (req, res) => {
  // Por ahora, devolvemos un array vacío hasta que implementemos la base de datos
  res.json({
    success: true,
    subscribers: []
  });
});

app.get('/api/subscribers/expiring', (req, res) => {
  // Suscriptores próximos a expirar
  res.json({
    success: true,
    subscribers: []
  });
});

app.post('/api/subscribers', (req, res) => {
  // Crear un nuevo suscriptor
  const newSubscriber = {
    _id: 'sub-' + Date.now(),
    ...req.body,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  res.json({
    success: true,
    subscriber: newSubscriber,
    message: 'Suscriptor creado exitosamente (modo demo)'
  });
});

app.put('/api/subscribers/:id', (req, res) => {
  // Actualizar suscriptor
  res.json({
    success: true,
    subscriber: { ...req.body, _id: req.params.id },
    message: 'Suscriptor actualizado exitosamente (modo demo)'
  });
});

app.delete('/api/subscribers/:id', (req, res) => {
  // Eliminar suscriptor
  res.json({
    success: true,
    message: 'Suscriptor eliminado exitosamente (modo demo)'
  });
});

app.get('/api/subscribers/:id', (req, res) => {
  // Obtener suscriptor por ID
  res.json({
    success: true,
    subscriber: {
      _id: req.params.id,
      name: 'Suscriptor Demo',
      email: 'demo@ejemplo.com',
      status: 'active'
    }
  });
});

// Contratos - Rutas básicas
app.get('/api/contracts', (req, res) => {
  res.json({
    success: true,
    contracts: []
  });
});

app.post('/api/contracts', (req, res) => {
  // Crear contrato
  const newContract = {
    _id: 'contract-' + Date.now(),
    ...req.body,
    uploadDate: new Date().toISOString()
  };
  res.json({
    success: true,
    contract: newContract,
    message: 'Contrato creado exitosamente (modo demo)'
  });
});

app.put('/api/contracts/:id', (req, res) => {
  // Actualizar contrato
  res.json({
    success: true,
    contract: { ...req.body, _id: req.params.id },
    message: 'Contrato actualizado exitosamente (modo demo)'
  });
});

app.delete('/api/contracts/:id', (req, res) => {
  // Eliminar contrato
  res.json({
    success: true,
    message: 'Contrato eliminado exitosamente (modo demo)'
  });
});

app.get('/api/contracts/download/:id', (req, res) => {
  // Descargar contrato (simulado)
  res.json({
    success: true,
    message: 'Descarga de contrato simulada (modo demo)',
    fileUrl: '/api/contracts/download/' + req.params.id
  });
});

app.post('/api/contracts/upload', (req, res) => {
  // Subir contrato (simulado)
  const newContract = {
    _id: 'contract-' + Date.now(),
    originalName: 'contrato.pdf',
    fileType: 'application/pdf',
    uploadDate: new Date().toISOString(),
    fileSize: 1024000
  };
  res.json({
    success: true,
    message: 'Contrato subido exitosamente (modo demo)',
    contract: newContract
  });
});

// Upload - Ruta adicional (para uploadAPI.uploadContract)
app.post('/api/upload/contract', (req, res) => {
  // Subir contrato (alternativa)
  const newContract = {
    _id: 'contract-' + Date.now(),
    originalName: 'contrato.pdf',
    fileType: 'application/pdf',
    uploadDate: new Date().toISOString(),
    fileSize: 1024000
  };
  res.json({
    success: true,
    message: 'Contrato subido exitosamente (modo demo)',
    contract: newContract
  });
});

// Administradores - Rutas básicas
app.get('/api/admins', (req, res) => {
  res.json({
    success: true,
    admins: [
      {
        _id: 'admin-1',
        name: 'Administrador Principal',
        email: 'admin@garlycorporations.com',
        role: 'superadmin'
      }
    ]
  });
});

app.post('/api/admins', (req, res) => {
  // Crear administrador
  const newAdmin = {
    _id: 'admin-' + Date.now(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  res.json({
    success: true,
    admin: newAdmin,
    message: 'Administrador creado exitosamente (modo demo)'
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: https://garlycorporations-frontend.onrender.com`);
  console.log(`🔧 CORS configurado para frontend específico`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - GET  /api/auth/verify`);
  console.log(`   - GET  /api/subscribers`);
  console.log(`   - POST /api/subscribers`);
  console.log(`   - GET  /api/contracts`);
  console.log(`   - POST /api/contracts/upload`);
  console.log(`   - ... y más`);
});
