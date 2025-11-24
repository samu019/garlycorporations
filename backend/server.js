import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== DATOS EN MEMORIA =====
let subscribers = [];
let admins = [
  {
    _id: '1',
    name: 'Administrador Principal',
    email: 'admin@garlycorporations.com',
    role: 'superadmin',
    isActive: true,
    createdAt: new Date()
  }
];

// ===== RUTAS DE AUTENTICACIÓN =====
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt:', email);
  
  if (email === 'admin@garlycorporations.com' && password === 'admin123') {
    res.json({
      success: true,
      token: 'dev_jwt_token_' + Date.now(),
      admin: {
        _id: '1',
        name: 'Administrador Principal',
        email: 'admin@garlycorporations.com',
        role: 'superadmin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  }
});

app.get('/api/auth/verify', (req, res) => {
  res.json({
    success: true,
    admin: {
      _id: '1',
      name: 'Administrador Principal',
      email: 'admin@garlycorporations.com',
      role: 'superadmin'
    }
  });
});

// ===== RUTAS DE SUSCRIPTORES =====
app.get('/api/subscribers', (req, res) => {
  res.json({
    success: true,
    subscribers: subscribers
  });
});

app.post('/api/subscribers', (req, res) => {
  try {
    const newSubscriber = {
      _id: Date.now().toString(),
      ...req.body,
      createdAt: new Date(),
      status: 'active',
      createdBy: '1'
    };
    
    subscribers.push(newSubscriber);
    
    console.log('✅ Suscriptor creado:', newSubscriber.name);
    
    res.json({
      success: true,
      subscriber: newSubscriber
    });
  } catch (error) {
    console.error('❌ Error creando suscriptor:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando suscriptor'
    });
  }
});

app.put('/api/subscribers/:id', (req, res) => {
  try {
    const id = req.params.id;
    const index = subscribers.findIndex(s => s._id === id);
    
    if (index !== -1) {
      subscribers[index] = { ...subscribers[index], ...req.body };
      res.json({ 
        success: true, 
        subscriber: subscribers[index] 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Suscriptor no encontrado' 
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error actualizando suscriptor'
    });
  }
});

app.delete('/api/subscribers/:id', (req, res) => {
  try {
    const id = req.params.id;
    const index = subscribers.findIndex(s => s._id === id);
    
    if (index !== -1) {
      const deletedSubscriber = subscribers.splice(index, 1)[0];
      console.log('🗑️ Suscriptor eliminado:', deletedSubscriber.name);
      res.json({ 
        success: true, 
        message: 'Suscriptor eliminado' 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Suscriptor no encontrado' 
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error eliminando suscriptor'
    });
  }
});

// ===== RUTAS DE UPLOAD =====
app.post('/api/upload/contract', (req, res) => {
  // Simular upload exitoso
  res.json({
    success: true,
    file: {
      filename: 'contrato_' + Date.now() + '.pdf',
      originalname: 'contrato.pdf',
      path: '/uploads/contratos/contrato_' + Date.now() + '.pdf',
      size: 1024000
    }
  });
});

// ===== RUTAS DE ADMINISTRADORES =====
app.get('/api/admins', (req, res) => {
  res.json({
    success: true,
    admins: admins
  });
});

// ===== RUTAS DEL SISTEMA =====
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running in offline mode',
    mode: 'offline (in-memory data)',
    subscribersCount: subscribers.length
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend funcionando en modo offline',
    timestamp: new Date().toISOString(),
    data: {
      subscribers: subscribers.length,
      admins: admins.length
    }
  });
});

// ===== SUSCRIPTORES POR VENCER =====
app.get('/api/subscribers/expiring', (req, res) => {
  const expiringSubscribers = subscribers.filter(sub => {
    const endDate = new Date(sub.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  });
  
  res.json({
    success: true,
    subscribers: expiringSubscribers
  });
});

// ===== MANEJO DE ERRORES =====
app.use((err, req, res, next) => {
  console.error('🔥 Error del servidor:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// ===== RUTA 404 =====
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ===== INICIAR SERVIDOR =====
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`💡 Modo: Offline (datos en memoria)`);
  console.log(`🔐 Login: admin@garlycorporations.com / admin123`);
  console.log(`📱 Frontend: http://localhost:3001`);
});
