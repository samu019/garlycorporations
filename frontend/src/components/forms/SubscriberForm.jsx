import React, { useState } from 'react';
import { subscribersAPI, uploadAPI } from '../../utils/api';
import { 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  CreditCard, 
  FileText,
  Upload,
  X,
  Plus
} from 'lucide-react';

const SubscriberForm = ({ onSuccess, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    country: initialData?.country || '',
    phone: initialData?.phone || '',
    paymentMethod: initialData?.paymentMethod || 'paypal',
    customPaymentMethod: initialData?.customPaymentMethod || '',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    endDate: initialData?.endDate || '',
    notes: initialData?.notes || '',
    termsAccepted: false,
    contractFile: initialData?.contractFile || null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showCustomCountry, setShowCustomCountry] = useState(false);
  const [customCountry, setCustomCountry] = useState('');

  // LISTA COMPLETA DE PAÍSES - SOLO NOMBRES (SIN BANDERAS)
  const countryGroups = {
    africa: [
      'Guinea Ecuatorial',
      'Ghana',
      'Marruecos',
      'Nigeria', 
      'Senegal',
      'Benin',
      'Camerún',
      'Costa de Marfil',
      'Kenia',
      'Egipto',
      'Sudáfrica',
      'Argelia',
      'Túnez',
      'Angola',
      'Etiopía'
    ],
    latinoamerica: [
      'México',
      'Argentina',
      'Colombia',
      'Chile',
      'Perú',
      'Brasil',
      'Ecuador',
      'Venezuela',
      'Bolivia',
      'Paraguay',
      'Uruguay',
      'Costa Rica',
      'Panamá',
      'Nicaragua',
      'Honduras',
      'El Salvador',
      'Guatemala',
      'República Dominicana',
      'Cuba',
      'Puerto Rico'
    ],
    europa: [
      'España',
      'Francia',
      'Italia',
      'Alemania',
      'Reino Unido',
      'Portugal',
      'Países Bajos',
      'Bélgica',
      'Suiza',
      'Suecia',
      'Noruega',
      'Dinamarca',
      'Finlandia',
      'Polonia',
      'Ucrania',
      'Austria',
      'Grecia',
      'Irlanda'
    ],
    asia: [
      'China',
      'Rusia',
      'Japón',
      'Corea del Sur',
      'India',
      'Indonesia',
      'Filipinas',
      'Tailandia',
      'Vietnam',
      'Malasia',
      'Singapur',
      'Arabia Saudita',
      'Emiratos Árabes Unidos',
      'Turquía',
      'Israel',
      'Pakistán',
      'Bangladés',
      'Sri Lanka'
    ],
    norteamerica: [
      'Estados Unidos',
      'Canadá'
    ],
    oceania: [
      'Australia',
      'Nueva Zelanda'
    ]
  };

  const paymentMethods = [
    { value: 'paypal', label: 'PayPal' },
    { value: 'binance', label: 'Binance' },
    { value: 'bizum', label: 'Bizum' },
    { value: 'credit_card', label: 'Tarjeta de Crédito' },
    { value: 'bank_transfer', label: 'Transferencia Bancaria' },
    { value: 'other', label: 'Otro método' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'];
    const fileType = file.type;
    
    if (!allowedTypes.includes(fileType)) {
      setError('Tipo de archivo no permitido. Solo PDF, DOC, JPG, PNG.');
      return;
    }

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      const uploadFormData = new FormData();
      uploadFormData.append('contract', file);
      
      const response = await uploadAPI.uploadContract(uploadFormData);
      
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          contractFile: response.data.file
        }));
      }
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      setError('Error subiendo archivo. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFormData(prev => ({
      ...prev,
      contractFile: null
    }));
  };

  const handleAddCustomCountry = () => {
    if (customCountry.trim()) {
      setFormData(prev => ({
        ...prev,
        country: customCountry.trim()
      }));
      setShowCustomCountry(false);
      setCustomCountry('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validar fechas
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        setError('La fecha de vencimiento debe ser posterior a la fecha de inicio');
        setLoading(false);
        return;
      }

      // Preparar datos para enviar
      const submitData = {
        ...formData,
        // Si es "other", usar customPaymentMethod, sino usar paymentMethod normal
        paymentMethod: formData.paymentMethod === 'other' ? 'other' : formData.paymentMethod,
        customPaymentMethod: formData.paymentMethod === 'other' ? formData.customPaymentMethod : ''
      };

      let response;
      if (initialData && initialData._id) {
        // Actualizar suscriptor existente
        response = await subscribersAPI.update(initialData._id, submitData);
      } else {
        // Crear nuevo suscriptor
        response = await subscribersAPI.create(submitData);
      }

      if (response.data.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error guardando suscriptor:', error);
      setError(error.response?.data?.message || 'Error guardando suscriptor');
    } finally {
      setLoading(false);
    }
  };

  const calculateEndDate = (startDate, months = 1) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {initialData ? 'Editar Suscriptor' : 'Nuevo Suscriptor'}
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Información Personal */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 text-primary-600 mr-2" />
            Información Personal
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="juan@ejemplo.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                País *
              </label>
              
              {!showCustomCountry ? (
                <div className="space-y-2">
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Selecciona un país</option>
                    
                    <optgroup label="África">
                      {countryGroups.africa.map(country => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </optgroup>
                    
                    <optgroup label="Latinoamérica">
                      {countryGroups.latinoamerica.map(country => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </optgroup>
                    
                    <optgroup label="Europa">
                      {countryGroups.europa.map(country => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </optgroup>
                    
                    <optgroup label="Asia">
                      {countryGroups.asia.map(country => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </optgroup>
                    
                    <optgroup label="Norteamérica">
                      {countryGroups.norteamerica.map(country => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </optgroup>
                    
                    <optgroup label="Oceanía">
                      {countryGroups.oceania.map(country => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  
                  <button
                    type="button"
                    onClick={() => setShowCustomCountry(true)}
                    className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar país manualmente
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customCountry}
                      onChange={(e) => setCustomCountry(e.target.value)}
                      placeholder="Escribe el nombre del país"
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCountry}
                      className="btn-primary whitespace-nowrap"
                    >
                      Agregar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomCountry(false)}
                      className="btn-secondary whitespace-nowrap"
                    >
                      Cancelar
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Escribe el nombre del país que deseas agregar
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="+34 123 456 789"
              />
            </div>
          </div>
        </div>

        {/* Información de Suscripción */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="h-5 w-5 text-primary-600 mr-2" />
            Información de Suscripción
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago *
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
                className="input-field"
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.paymentMethod === 'other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especificar Método de Pago *
                </label>
                <input
                  type="text"
                  name="customPaymentMethod"
                  value={formData.customPaymentMethod}
                  onChange={handleChange}
                  required={formData.paymentMethod === 'other'}
                  className="input-field"
                  placeholder="Ej: Transferencia, Efectivo, etc."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Vencimiento *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                min={formData.startDate}
                className="input-field"
              />
              <div className="flex space-x-2 mt-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    endDate: calculateEndDate(prev.startDate, 1)
                  }))}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  1 mes
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    endDate: calculateEndDate(prev.startDate, 3)
                  }))}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  3 meses
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    endDate: calculateEndDate(prev.startDate, 12)
                  }))}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  1 año
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contrato y Documentos */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 text-primary-600 mr-2" />
            Contrato y Documentos
          </h3>
          
          <div className="space-y-4">
            {!formData.contractFile ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subir Contrato (Opcional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    id="contract-upload"
                  />
                  <label
                    htmlFor="contract-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {uploading ? 'Subiendo archivo...' : 'Haz clic para subir contrato'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PDF, DOC, JPG, PNG (Máx. 10MB)
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Contrato subido correctamente
                    </p>
                    <p className="text-xs text-green-600">
                      Archivo listo para guardar
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas Adicionales
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="input-field"
                placeholder="Información adicional sobre el suscriptor..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.notes.length}/500 caracteres
              </p>
            </div>
          </div>
        </div>

        {/* Términos y Condiciones */}
        <div className="card">
          <div className="flex items-start">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              required
              className="mt-1 mr-3"
            />
            <label className="text-sm text-gray-700">
              Confirmo que el suscriptor ha aceptado los términos y condiciones del servicio premium 
              y he verificado la información proporcionada. *
            </label>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !formData.termsAccepted}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : (initialData ? 'Actualizar Suscriptor' : 'Crear Suscriptor')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubscriberForm;
