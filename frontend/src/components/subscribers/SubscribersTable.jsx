import React from 'react';
import { Edit, Trash2, Eye, Mail, MapPin, Calendar, CreditCard } from 'lucide-react';

const SubscribersTable = ({ subscribers, onEdit, onDelete, onView }) => {
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Activo' },
      expiring: { color: 'bg-yellow-100 text-yellow-800', label: 'Por Vencer' },
      expired: { color: 'bg-red-100 text-red-800', label: 'Expirado' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelado' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentMethodLabel = (method, customMethod = '') => {
    const methods = {
      paypal: 'PayPal',
      binance: 'Binance',
      bizum: 'Bizum',
      credit_card: 'Tarjeta de Crédito',
      bank_transfer: 'Transferencia Bancaria',
      other: customMethod || 'Otro método'
    };
    
    return methods[method] || method;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const calculateDaysUntilExpiry = (endDate) => {
    const today = new Date();
    const expiryDate = new Date(endDate);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expirado';
    if (diffDays === 0) return 'Vence hoy';
    if (diffDays === 1) return 'Vence en 1 día';
    if (diffDays <= 30) return `Vence en ${diffDays} días`;
    return `Vence en ${Math.ceil(diffDays / 30)} meses`;
  };

  if (!subscribers || subscribers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Mail className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay suscriptores
        </h3>
        <p className="text-gray-500">
          Comienza agregando tu primer suscriptor premium.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Suscriptor
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              País
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Método de Pago
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vencimiento
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {subscribers.map((subscriber) => (
            <tr key={subscriber._id} className="hover:bg-gray-50">
              {/* Información del Suscriptor */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {subscriber.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {subscriber.email}
                    </div>
                  </div>
                </div>
              </td>

              {/* País */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-900">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  {subscriber.country}
                </div>
              </td>

              {/* Método de Pago */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-900">
                  <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                  {getPaymentMethodLabel(subscriber.paymentMethod, subscriber.customPaymentMethod)}
                </div>
              </td>

              {/* Estado */}
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(subscriber.status)}
              </td>

              {/* Vencimiento */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    {formatDate(subscriber.endDate)}
                  </div>
                  <div className={`text-xs ${
                    calculateDaysUntilExpiry(subscriber.endDate).includes('Expirado') 
                      ? 'text-red-600' 
                      : calculateDaysUntilExpiry(subscriber.endDate).includes('hoy') 
                        ? 'text-yellow-600' 
                        : 'text-gray-500'
                  }`}>
                    {calculateDaysUntilExpiry(subscriber.endDate)}
                  </div>
                </div>
              </td>

              {/* Acciones - BOTONES CORREGIDOS */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  {/* Botón Ver */}
                  <button
                    onClick={() => onView(subscriber)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  {/* Botón Editar */}
                  <button
                    onClick={() => onEdit(subscriber)}
                    className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                    title="Editar suscriptor"
                  >
                    <Edit className="h-4 w-4" />
                  </button>

                  {/* Botón Eliminar */}
                  <button
                    onClick={() => onDelete(subscriber)}
                    className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                    title="Eliminar suscriptor"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubscribersTable;
