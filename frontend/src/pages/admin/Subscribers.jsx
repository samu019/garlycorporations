import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { subscribersAPI } from '../../utils/api';
import SubscriberForm from '../../components/forms/SubscriberForm';
import SubscribersTable from '../../components/subscribers/SubscribersTable';
import {
  Plus,
  Search,
  Download
} from 'lucide-react';

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    loadSubscribers();
  }, []);

  // Cargar suscriptores
  const loadSubscribers = async () => {
    try {
      setLoading(true);
      const response = await subscribersAPI.getAll();
      if (response.data.success) {
        setSubscribers(response.data.subscribers);
      }
    } catch (error) {
      console.error('Error cargando suscriptores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para crear/actualizar suscriptor
  const handleSaveSubscriber = async () => {
    await loadSubscribers();
    setShowForm(false);
    setSelectedSubscriber(null);
  };

  // Función para editar suscriptor
  const handleEditSubscriber = async (subscriber) => {
    setSelectedSubscriber(subscriber);
    setShowForm(true);
  };

  // Función para eliminar suscriptor
  const handleDeleteSubscriber = async (subscriber) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al suscriptor ${subscriber.name}?`)) {
      try {
        const response = await subscribersAPI.delete(subscriber._id);
        if (response.data.success) {
          await loadSubscribers();
        }
      } catch (error) {
        console.error('Error eliminando suscriptor:', error);
        alert('Error al eliminar el suscriptor');
      }
    }
  };

  // Función para ver detalles
  const handleViewSubscriber = (subscriber) => {
    console.log('Ver suscriptor:', subscriber);
    alert(`Viendo detalles de: ${subscriber.name}\nEmail: ${subscriber.email}\nPaís: ${subscriber.country}`);
  };

  // Filtrar suscriptores
  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = 
      subscriber.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.country?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || subscriber.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suscriptores Premium</h1>
          <p className="text-gray-600">Gestiona tus suscriptores premium</p>
        </div>
        <button
          onClick={() => {
            setSelectedSubscriber(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Suscriptor
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar suscriptores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Filtro por Estado */}
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="expiring">Por Vencer</option>
              <option value="expired">Expirado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Botón Exportar */}
          <button className="btn-secondary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Tabla de Suscriptores */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <SubscribersTable
          subscribers={filteredSubscribers}
          onEdit={handleEditSubscriber}
          onDelete={handleDeleteSubscriber}
          onView={handleViewSubscriber}
        />
      </div>

      {/* Modal Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <SubscriberForm
              onSuccess={handleSaveSubscriber}
              onCancel={() => {
                setShowForm(false);
                setSelectedSubscriber(null);
              }}
              initialData={selectedSubscriber}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscribers;
