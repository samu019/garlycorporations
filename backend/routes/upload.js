import express from 'express';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configurar multer para upload de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/contracts'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'contract-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo PDF, DOC, JPG, PNG.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limite
  },
  fileFilter: fileFilter
});

// Middleware de autenticacion
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

// @desc    Subir contrato
// @route   POST /api/upload/contract
// @access  Private
router.post('/contract', authMiddleware, upload.single('contract'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Por favor selecciona un archivo'
      });
    }

    res.json({
      success: true,
      message: 'Archivo subido exitosamente',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: `/uploads/contracts/${req.file.filename}`,
        size: req.file.size
      }
    });

  } catch (error) {
    console.error('Error subiendo archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error subiendo archivo'
    });
  }
});

export default router;
