import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, Users, Calendar, RefreshCw } from 'lucide-react';
import { subscribersAPI } from '../../utils/api'; // ← RUTA CORRECTA

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await subscribersAPI.getAll();
      
      if (response.data.success) {
        const subscribers = response.data.subscribers;
        const generatedAlerts = generateAlertsFromSubscribers(subscribers);
        setAlerts(generatedAlerts);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error cargando alertas:', error);
      // En caso de error, mostrar alertas de ejemplo coordinadas
      setAlerts(getCoordinatedSampleAlerts());
    } finally {
      setLoading(false);
    }
  };

  // GENERAR ALERTAS BASADAS EN SUSCRIPTORES REALES
  const generateAlertsFromSubscribers = (subscribers) => {
    const today = new Date();
    const alerts = [];

    subscribers.forEach(subscriber => {
      if (!subscriber.endDate) return;

      const endDate = new Date(subscriber.endDate);
      const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      
      // ALERTA: Suscripción vencida
      if (daysUntilExpiry < 0) {
        alerts.push({
          id: `expired_${subscriber._id}`,
          type: 'error',
          title: 'Suscripción vencida',
          message: `La suscripción de ${subscriber.name} ha vencido`,
          date: subscriber.endDate,
          subscriber: subscriber.name,
          subscriberId: subscriber._id,
          days: daysUntilExpiry,
          priority: 1
        });
      }
      // ALERTA: Por vencer (menos de 7 días)
      else if (daysUntilExpiry <= 7) {
        alerts.push({
          id: `expiring_${subscriber._id}`,
          type: 'warning',
          title: 'Suscripción por vencer',
          message: `La suscripción de ${subscriber.name} vence en ${daysUntilExpiry} días`,
          date: subscriber.endDate,
          subscriber: subscriber.name,
          subscriberId: subscriber._id,
          days: daysUntilExpiry,
          priority: 2
        });
      }

      // ALERTA: Nuevo suscriptor (últimos 3 días)
      const createdDate = new Date(subscriber.createdAt || subscriber.startDate);
      const daysSinceCreation = Math.ceil((today - createdDate) / (1000 * 60 * 60 * 24));
      
      if (daysSinceCreation <= 3) {
        alerts.push({
          id: `new_${subscriber._id}`,
          type: 'info',
          title: 'Nueva suscripción',
          message: `${subscriber.name} se ha registrado como nuevo suscriptor`,
          date: createdDate.toISOString().split('T')[0],
          subscriber: subscriber.name,
          subscriberId: subscriber._id,
          days: daysSinceCreation,
          priority: 3
        });
      }
    });

    return alerts.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return new Date(a.date) - new Date(b.date);
    });
  };

  // DATOS DE EJEMPLO COORDINADOS (como respaldo)
  const getCoordinatedSampleAlerts = () => {
    const today = new Date();
    return [
      {
        id: 1,
        type: 'warning',
        title: 'Suscripción por vencer',
        message: 'La suscripción de María García vence en 3 días',
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subscriber: 'María García',
        priority: 2,
        days: 3
      },
      {
        id: 2,
        type: 'error',
        title: 'Suscripción vencida',
        message: 'La suscripción de Ana Martínez ha vencido',
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subscriber: 'Ana Martínez',
        priority: 1,
        days: -2
      },
      {
        id: 3,
        type: 'info',
        title: 'Nueva suscripción',
        message: 'Juan Pérez se ha registrado como nuevo suscriptor',
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subscriber: 'Juan Pérez',
        priority: 3,
        days: 1
      }
    ];
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'error': return Bell;
      case 'info': return Info;
      default: return Users;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-100 border-red-200';
      case 'info': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-green-600 bg-green-100 border-green-200';
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Alertas
            </h1>
            <p className="text-gray-600">Notificaciones y recordatorios del sistema</p>
          </div>
        </div>

        <div className="grid gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Alertas
          </h1>
          <p className="text-gray-600">Notificaciones y recordatorios del sistema</p>
          <p className="text-sm text-gray-500 mt-1">
            Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
          </p>
        </div>
        <button
          onClick={loadAlerts}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <Bell className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-red-600">Vencidas</p>
              <p className="text-2xl font-bold text-red-900">
                {alerts.filter(a => a.type === 'error').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-yellow-600">Por Vencer</p>
              <p className="text-2xl font-bold text-yellow-900">
                {alerts.filter(a => a.type === 'warning').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-600">Nuevas</p>
              <p className="text-2xl font-bold text-blue-900">
                {alerts.filter(a => a.type === 'info').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay alertas pendientes
            </h3>
            <p className="text-gray-500">
              ¡Todo está bajo control! No hay notificaciones urgentes en este momento.
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const Icon = getIcon(alert.type);
            return (
              <div 
                key={alert.id} 
                className="bg-white rounded-xl shadow-lg border-l-4 overflow-hidden animate-fade-in"
                style={{ 
                  borderLeftColor: alert.type === 'warning' ? '#f59e0b' : 
                                 alert.type === 'error' ? '#ef4444' : '#3b82f6' 
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 rounded-full p-3 ${getColor(alert.type)}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(alert.type)}`}>
                            {alert.type === 'error' ? 'Urgente' : 
                             alert.type === 'warning' ? 'Importante' : 'Informativo'}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{alert.subscriber}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{formatDate(alert.date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500 block mb-2">
                        {formatDate(alert.date)}
                      </span>
                      {alert.days && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          alert.type === 'error' ? 'bg-red-100 text-red-800' :
                          alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {alert.type === 'info' ? 'Nuevo' : 
                           Math.abs(alert.days) === 1 ? '1 día' : 
                           `${Math.abs(alert.days)} días`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Alerts;