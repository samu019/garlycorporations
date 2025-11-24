import express from 'express';
import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware para verificar token y rol de superadmin
const superAdminMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Se requieren privilegios de superadministrador'
      });
    }

    req.adminId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token invalido'
    });
  }
};

// @desc    Obtener todos los administradores
// @route   GET /api/admins
// @access  Private (Superadmin only)
router.get('/', superAdminMiddleware, async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    
    res.json({
      success: true,
      admins,
      count: admins.length
    });

  } catch (error) {
    console.error('Error obteniendo administradores:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
});

// @desc    Crear nuevo administrador
// @route   POST /api/admins
// @access  Private (Superadmin only)
router.post('/', superAdminMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validar campos
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor completa todos los campos'
      });
    }

    // Verificar si el email ya existe
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'El email ya esta registrado'
      });
    }

    // Crear administrador
    const admin = new Admin({
      name,
      email,
      password,
      role: role || 'admin'
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Administrador creado exitosamente',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive
      }
    });

  } catch (error) {
    console.error('Error creando administrador:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
});

export default router;
