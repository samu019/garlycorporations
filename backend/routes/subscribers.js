import express from 'express';
import Subscriber from '../models/Subscriber.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware para verificar token
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token invalido'
    });
  }
};

// @desc    Obtener todos los suscriptores
// @route   GET /api/subscribers
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }

    const subscribers = await Subscriber.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Subscriber.countDocuments(query);

    res.json({
      success: true,
      subscribers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error obteniendo suscriptores:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
});

// @desc    Crear nuevo suscriptor
// @route   POST /api/subscribers
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      email,
      country,
      phone,
      paymentMethod,
      customPaymentMethod,
      startDate,
      endDate,
      notes,
      termsAccepted
    } = req.body;

    // Validar campos requeridos
    if (!name || !email || !country || !paymentMethod || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Por favor completa todos los campos requeridos'
      });
    }

    if (!termsAccepted) {
      return res.status(400).json({
        success: false,
        message: 'Debes aceptar los terminos y condiciones'
      });
    }

    const subscriber = new Subscriber({
      name,
      email,
      country,
      phone,
      paymentMethod,
      customPaymentMethod,
      startDate,
      endDate,
      notes,
      termsAccepted,
      createdBy: req.adminId
    });

    await subscriber.save();
    await subscriber.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Suscriptor creado exitosamente',
      subscriber
    });

  } catch (error) {
    console.error('Error creando suscriptor:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'El email ya esta registrado'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
});

// @desc    Obtener suscriptores proximos a vencer
// @route   GET /api/subscribers/expiring
// @access  Private
router.get('/expiring', authMiddleware, async (req, res) => {
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringSubscribers = await Subscriber.find({
      endDate: { 
        $lte: sevenDaysFromNow,
        $gte: new Date()
      },
      status: { $in: ['active', 'expiring'] }
    }).populate('createdBy', 'name email');

    res.json({
      success: true,
      subscribers: expiringSubscribers,
      count: expiringSubscribers.length
    });

  } catch (error) {
    console.error('Error obteniendo suscriptores proximos a vencer:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
});

export default router;
