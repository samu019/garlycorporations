import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener mas de 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email valido']
  },
  country: {
    type: String,
    required: [true, 'El pais es requerido'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    required: [true, 'El metodo de pago es requerido'],
    enum: ['paypal', 'binance', 'bizum', 'credit_card', 'bank_transfer', 'other'],
    default: 'paypal'
  },
  customPaymentMethod: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'La fecha de inicio es requerida'],
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'La fecha de vencimiento es requerida']
  },
  status: {
    type: String,
    enum: ['active', 'expiring', 'expired', 'cancelled'],
    default: 'active'
  },
  contractFile: {
    type: String
  },
  notes: {
    type: String,
    maxlength: [500, 'Las notas no pueden tener mas de 500 caracteres']
  },
  termsAccepted: {
    type: Boolean,
    required: [true, 'Debe aceptar los terminos y condiciones'],
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Middleware para actualizar status basado en fechas
subscriberSchema.pre('save', function(next) {
  const now = new Date();
  const daysUntilExpiry = Math.ceil((this.endDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
    this.status = 'expiring';
  } else if (this.endDate < now) {
    this.status = 'expired';
  } else {
    this.status = 'active';
  }
  
  next();
});

// Indices para mejor performance
subscriberSchema.index({ email: 1 });
subscriberSchema.index({ endDate: 1 });
subscriberSchema.index({ status: 1 });
subscriberSchema.index({ createdAt: -1 });

// Metodo para verificar si esta por expirar
subscriberSchema.methods.isExpiringSoon = function() {
  const now = new Date();
  const daysUntilExpiry = Math.ceil((this.endDate - now) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
};

// Metodo para verificar si esta expirado
subscriberSchema.methods.isExpired = function() {
  return this.endDate < new Date();
};

export default mongoose.model('Subscriber', subscriberSchema);
