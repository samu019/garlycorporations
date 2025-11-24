import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Edit, Trash2, FileText, Upload, X, User, Mail, Calendar } from 'lucide-react';
import { subscribersAPI } from '../../utils/api';

const Contracts = () => {
  const [contracts, setContracts] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Estado para el formulario de upload
  const [uploadData, setUploadData] = useState({
    subscriberId: '',
    contractFile: null,
    contractName: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  // Cargar contratos y suscriptores
  useEffect(() => {
    loadContracts();
    loadSubscribers();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando contratos...');
      
      // Como el endpoint /contracts no existe, usar datos locales
      const localContracts = getLocalContracts();
      setContracts(localContracts);
      console.log(`✅ ${localContracts.length} contratos cargados localmente`);
      
    } catch (error) {
      console.error('❌ Error cargando contratos:', error);
      // En caso de error, mostrar datos de prueba
      setContracts(getSampleContracts());
    } finally {
      setLoading(false);
    }
  };

  const loadSubscribers = async () => {
    try {
      console.log('🔄 Cargando suscriptores...');
      const response = await subscribersAPI.getAll();
      if (response.data.success) {
        setSubscribers(response.data.subscribers);
        console.log(`✅ ${response.data.subscribers.length} suscriptores cargados`);
      }
    } catch (error) {
      console.error('❌ Error cargando suscriptores:', error);
    }
  };

  // OBTENER CONTRATOS DEL LOCALSTORAGE
  const getLocalContracts = () => {
    try {
      const savedContracts = localStorage.getItem('garlyContracts');
      if (savedContracts) {
        return JSON.parse(savedContracts);
      }
    } catch (error) {
      console.log('No hay contratos guardados localmente');
    }
    return getSampleContracts();
  };

  // GUARDAR CONTRATOS EN LOCALSTORAGE
  const saveContractsToLocal = (contractsList) => {
    try {
      localStorage.setItem('garlyContracts', JSON.stringify(contractsList));
      console.log('💾 Contratos guardados en localStorage');
    } catch (error) {
      console.error('Error guardando contratos en localStorage:', error);
    }
  };

  // DATOS DE PRUEBA INICIALES
  const getSampleContracts = () => {
    return [
      {
        _id: '1',
        subscriberName: 'Carlos Benjamin',
        originalName: 'contrato_carlos_benjamin.pdf',
        fileType: 'application/pdf',
        uploadDate: new Date().toISOString(),
        fileSize: 1024576,
        subscriberId: 'sample-1',
        startDate: '2025-11-24',
        endDate: '2025-12-24'
      },
      {
        _id: '2', 
        subscriberName: 'Ana Rodríguez',
        originalName: 'contrato_ana_rodriguez.docx',
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        fileSize: 512000,
        subscriberId: 'sample-2',
        startDate: '2025-11-22',
        endDate: '2025-12-22'
      }
    ];
  };

  // Manejar subida de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('📁 Archivo seleccionado:', file.name);
      setUploadData({
        ...uploadData,
        contractFile: file,
        contractName: file.name
      });
    }
  };

  // SUBIR CONTRATO - VERSIÓN LOCAL
  const handleUpload = async () => {
    if (!uploadData.subscriberId || !uploadData.contractFile) {
      alert('❌ Por favor, selecciona un suscriptor y un archivo');
      return;
    }

    try {
      setUploadLoading(true);
      
      // Encontrar el nombre del suscriptor seleccionado
      const selectedSubscriber = subscribers.find(sub => sub._id === uploadData.subscriberId);
      if (!selectedSubscriber) {
        alert('❌ Suscriptor no encontrado');
        return;
      }

      console.log('🚀 Creando nuevo contrato local...', {
        subscriberName: selectedSubscriber.name,
        fileName: uploadData.contractFile.name
      });

      // Crear nuevo contrato local
      const newContract = {
        _id: 'contract-' + Date.now(),
        subscriberName: selectedSubscriber.name,
        subscriberId: uploadData.subscriberId,
        originalName: uploadData.contractFile.name,
        fileType: uploadData.contractFile.type,
        uploadDate: new Date().toISOString(),
        fileSize: uploadData.contractFile.size,
        startDate: uploadData.startDate,
        endDate: uploadData.endDate
      };

      // Agregar a la lista local
      const updatedContracts = [newContract, ...contracts];
      setContracts(updatedContracts);
      saveContractsToLocal(updatedContracts);

      alert('✅ Contrato subido exitosamente (almacenado localmente)');
      setShowUploadModal(false);
      resetUploadForm();
      
    } catch (error) {
      console.error('❌ Error subiendo contrato:', error);
      alert('❌ Error al subir el contrato: ' + error.message);
    } finally {
      setUploadLoading(false);
    }
  };

  // Resetear formulario de upload
  const resetUploadForm = () => {
    setUploadData({
      subscriberId: '',
      contractFile: null,
      contractName: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
  };

  // DESCARGAR CONTRATO - VERSIÓN LOCAL
  const handleDownload = async (contract) => {
    try {
      console.log('📥 Descargando contrato:', contract.originalName);
      
      // Crear un blob simulado para descargar
      const content = `CONTRATO GARLY CORPORATIONS\n\n` +
        `Suscriptor: ${contract.subscriberName}\n` +
        `Archivo: ${contract.originalName}\n` +
        `Fecha Inicio: ${contract.startDate}\n` +
        `Fecha Fin: ${contract.endDate}\n` +
        `Subido: ${new Date(contract.uploadDate).toLocaleDateString('es-ES')}\n\n` +
        `Este es un archivo de contrato simulado. En producción, se descargaría el archivo real.`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = contract.originalName.replace(/\.[^/.]+$/, "") + '.txt'; // Cambiar extensión a .txt
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert(`📥 Descargando: ${contract.originalName} (archivo simulado)`);
      
    } catch (error) {
      console.error('❌ Error descargando contrato:', error);
      alert('❌ Error al descargar el contrato');
    }
  };

  // ELIMINAR CONTRATO - VERSIÓN LOCAL
  const handleDelete = async (contract) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el contrato de ${contract.subscriberName}?`)) {
      try {
        // Eliminar localmente
        const updatedContracts = contracts.filter(c => c._id !== contract._id);
        setContracts(updatedContracts);
        saveContractsToLocal(updatedContracts);
        
        alert('✅ Contrato eliminado exitosamente');
        
      } catch (error) {
        console.error('❌ Error eliminando contrato:', error);
        alert('❌ Error al eliminar el contrato');
      }
    }
  };

  // Formatear tamaño del archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Obtener icono según tipo de archivo
  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('image')) return '🖼️';
    return '📎';
  };

  // Obtener tipo de archivo legible
  const getFileTypeText = (fileType) => {
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word') || fileType.includes('document')) return 'Word';
    if (fileType.includes('image')) return 'Imagen';
    return 'Archivo';
  };

  // Filtrar contratos
  const filteredContracts = contracts.filter(contract =>
    contract.subscriberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.originalName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Contratos
          </h1>
          <p className="text-gray-600">Gestión de contratos de suscriptores</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>Subir Contrato</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar contratos por nombre de suscriptor o archivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Tabla de Contratos */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredContracts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay contratos
            </h3>
            <p className="text-gray-500 mb-4">
              Comienza subiendo tu primer contrato.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <Upload className="h-4 w-4" />
              <span>Subir Primer Contrato</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suscriptor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Archivo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Subida
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamaño
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract) => (
                  <tr key={contract._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contract.subscriberName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {contract.startDate} - {contract.endDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">{getFileIcon(contract.fileType)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {contract.originalName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getFileTypeText(contract.fileType)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(contract.uploadDate).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatFileSize(contract.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownload(contract)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Descargar contrato"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(contract)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title="Eliminar contrato"
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
        )}
      </div>

      {/* Modal de Subir Contrato */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Subir Nuevo Contrato
                </h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetUploadForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Seleccionar Suscriptor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Seleccionar Suscriptor
                </label>
                <select
                  value={uploadData.subscriberId}
                  onChange={(e) => setUploadData({...uploadData, subscriberId: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Selecciona un suscriptor</option>
                  {subscribers.map((subscriber) => (
                    <option key={subscriber._id} value={subscriber._id}>
                      {subscriber.name} - {subscriber.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fechas del Contrato */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={uploadData.startDate}
                    onChange={(e) => setUploadData({...uploadData, startDate: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={uploadData.endDate}
                    onChange={(e) => setUploadData({...uploadData, endDate: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Subir Archivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="h-4 w-4 inline mr-1" />
                  Archivo del Contrato
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    id="contract-file"
                  />
                  <label htmlFor="contract-file" className="cursor-pointer">
                    {uploadData.contractFile ? (
                      <div className="text-green-600">
                        <FileText className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">{uploadData.contractName}</p>
                        <p className="text-xs text-gray-500">Haz clic para cambiar el archivo</p>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <Upload className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">Haz clic para seleccionar archivo</p>
                        <p className="text-xs">PDF, Word, imágenes (MAX 10MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetUploadForm();
                  }}
                  className="btn-secondary"
                  disabled={uploadLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploadLoading || !uploadData.subscriberId || !uploadData.contractFile}
                  className="btn-primary flex items-center space-x-2"
                >
                  {uploadLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Subir Contrato</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contracts;