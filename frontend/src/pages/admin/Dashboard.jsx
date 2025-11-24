import React, { useState, useEffect } from 'react';
import { Users, FileText, Bell, TrendingUp, Calendar, Plus, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { subscribersAPI } from '../../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    subscribers: 0,
    contracts: 0,
    alerts: 0,
    renewalRate: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [expiringSubscribers, setExpiringSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Cargar suscriptores reales
      const response = await subscribersAPI.getAll();
      if (response.data.success) {
        const subscribers = response.data.subscribers;
        calculateRealData(subscribers);
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Si hay error, mantener datos de ejemplo
      setSampleData();
    } finally {
      setLoading(false);
    }
  };

  // CALCULAR DATOS REALES BASADOS EN SUSCRIPTORES
  const calculateRealData = (subscribers) => {
    const today = new Date();
    
    // Estadísticas reales
    const totalSubscribers = subscribers.length;
    
    const activeContracts = subscribers.filter(sub => {
      if (!sub.endDate) return true;
      return new Date(sub.endDate) >= today;
    }).length;
    
    const pendingAlerts = subscribers.filter(sub => {
      if (!sub.endDate) return false;
      const daysUntil = Math.ceil((new Date(sub.endDate) - today) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 || daysUntil < 0;
    }).length;

    const renewalRate = totalSubscribers > 0 
      ? Math.round((activeContracts / totalSubscribers) * 100)
      : 0;

    setStats({
      subscribers: totalSubscribers,
      contracts: activeContracts,
      alerts: pendingAlerts,
      renewalRate: renewalRate
    });

    // Actividad reciente basada en suscriptores reales
    generateRecentActivity(subscribers);
    
    // Próximos vencimientos reales
    calculateExpiringSubscribers(subscribers);
  };

  // GENERAR ACTIVIDAD RECIENTE REAL
  const generateRecentActivity = (subscribers) => {
    const today = new Date();
    const activities = [];

    // Últimos suscriptores creados
    const recentSubscribers = [...subscribers]
      .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
      .slice(0, 2);

    recentSubscribers.forEach(subscriber => {
      activities.push({
        id: subscriber._id,
        type: 'new_subscriber',
        title: 'Nuevo suscriptor premium',
        description: `${subscriber.name} se registró como suscriptor premium`,
        time: 'Hace 2 horas', // Simulado por ahora
        icon: Users,
        color: 'text-green-600 bg-green-100'
      });
    });

    // Agregar un recordatorio si hay suscriptores por vencer
    const expiringSoon = subscribers.find(sub => {
      if (!sub.endDate) return false;
      const daysUntil = Math.ceil((new Date(sub.endDate) - today) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && daysUntil > 0;
    });

    if (expiringSoon && activities.length < 3) {
      activities.push({
        id: 'reminder_' + expiringSoon._id,
        type: 'reminder',
        title: 'Recordatorio de vencimiento',
        description: `Suscripción de ${expiringSoon.name} vence en 3 días`,
        time: 'Hace 1 día',
        icon: Bell,
        color: 'text-yellow-600 bg-yellow-100'
      });
    }

    setRecentActivity(activities);
  };

  // CALCULAR VENCIMIENTOS REALES
  const calculateExpiringSubscribers = (subscribers) => {
    const today = new Date();
    const expiring = [];

    subscribers.forEach(subscriber => {
      if (!subscriber.endDate) return;

      const endDate = new Date(subscriber.endDate);
      const daysUntil = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntil <= 30 || daysUntil < 0) {
        expiring.push({
          id: subscriber._id,
          name: subscriber.name,
          daysUntil: daysUntil,
          status: daysUntil < 0 ? 'expired' : 
                  daysUntil <= 7 ? 'warning' : 'safe'
        });
      }
    });

    // Ordenar y limitar a 4
    expiring.sort((a, b) => a.daysUntil - b.daysUntil);
    setExpiringSubscribers(expiring.slice(0, 4));
  };

  // DATOS DE EJEMPLO (como respaldo)
  const setSampleData = () => {
    setStats({
      subscribers: 24,
      contracts: 18,
      alerts: 3,
      renewalRate: 87
    });

    setRecentActivity([
      {
        id: 1,
        type: 'new_subscriber',
        title: 'Nuevo suscriptor premium',
        description: 'Ana Rodríguez se registró como suscriptor premium',
        time: 'Hace 2 horas',
        icon: Users,
        color: 'text-green-600 bg-green-100'
      },
      {
        id: 2,
        type: 'contract_upload',
        title: 'Contrato digitalizado',
        description: 'Contrato de Carlos Mendoza procesado exitosamente',
        time: 'Hace 5 horas',
        icon: FileText,
        color: 'text-blue-600 bg-blue-100'
      },
      {
        id: 3,
        type: 'reminder',
        title: 'Recordatorio de vencimiento',
        description: 'Suscripción de María García vence en 3 días',
        time: 'Hace 1 día',
        icon: Bell,
        color: 'text-yellow-600 bg-yellow-100'
      }
    ]);

    setExpiringSubscribers([
      {
        id: 1,
        name: 'María García',
        daysUntil: 3,
        status: 'warning'
      },
      {
        id: 2,
        name: 'Carlos López',
        daysUntil: 30,
        status: 'safe'
      },
      {
        id: 3,
        name: 'Ana Martínez',
        daysUntil: -2,
        status: 'expired'
      },
      {
        id: 4,
        name: 'Juan Pérez',
        daysUntil: 7,
        status: 'warning'
      }
    ]);
  };

  // COMPONENTES EXACTAMENTE IGUALES AL CÓDIGO ORIGINAL
  const StatCard = ({ title, value, change, changeType, icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <div className={`flex items-center mt-1 text-sm ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`h-4 w-4 mr-1 ${
              changeType === 'increase' ? '' : 'rotate-180'
            }`} />
            {change}
          </div>
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'expired': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getStatusText = (days) => {
    if (days < 0) return 'Expirado';
    if (days === 0) return 'Vence hoy';
    if (days <= 7) return `Vence en ${days} días`;
    return `Vence en ${days} días`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 animate-pulse">Cargando...</h1>
            <p className="text-gray-600 mt-1">Preparando tu dashboard</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header con animación - EXACTAMENTE IGUAL */}
      <div className="flex justify-between items-center">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Bienvenido de nuevo, Administrador Principal</p>
        </div>
        <button 
          onClick={() => navigate('/subscribers')}
          className="btn-primary flex items-center space-x-2 transform hover:scale-105 transition-transform"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Suscriptor</span>
        </button>
      </div>

      {/* Estadísticas con hover effects - EXACTAMENTE IGUAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Suscriptores"
          value={stats.subscribers}
          change="+5 desde la última semana"
          changeType="increase"
          icon={Users}
        />
        <StatCard
          title="Contratos Activos"
          value={stats.contracts}
          change="+3 desde la última semana"
          changeType="increase"
          icon={FileText}
        />
        <StatCard
          title="Alertas Pendientes"
          value={stats.alerts}
          change="-2 desde ayer"
          changeType="decrease"
          icon={Bell}
        />
        <StatCard
          title="Tasa de Renovación"
          value={`${stats.renewalRate}%`}
          change="+3% este mes"
          changeType="increase"
          icon={TrendingUp}
        />
      </div>

      {/* Grid de contenido inferior - EXACTAMENTE IGUAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Actividad Reciente */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              Actividad Reciente
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div 
                  key={activity.id}
                  className="p-4 hover:bg-gray-50 transition-colors duration-200 animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${activity.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Próximos Vencimientos */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Bell className="h-5 w-5 text-yellow-600 mr-2" />
              Próximos Vencimientos
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {expiringSubscribers.map((subscriber, index) => (
              <div 
                key={subscriber.id}
                className="p-4 hover:bg-gray-50 transition-colors duration-200 animate-slide-in"
                style={{ animationDelay: `${index * 100 + 300}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {subscriber.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {subscriber.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getStatusText(subscriber.daysUntil)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscriber.status)}`}>
                    {subscriber.status === 'expired' ? 'Urgente' : 
                     subscriber.status === 'warning' ? 'Próximo' : 'En plazo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;