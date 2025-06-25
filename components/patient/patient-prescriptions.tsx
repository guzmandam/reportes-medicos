'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pill, Calendar, User, FileText, Search, X } from 'lucide-react';
import api from '@/lib/axios';
import { Prescription } from '@/types/patient';

interface PatientPrescriptionsProps {
  patientId: string;
}

export default function PatientPrescriptions({ patientId }: PatientPrescriptionsProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);

  const fetchPrescriptions = async (medicationName?: string, startDateFilter?: string, endDateFilter?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (medicationName && medicationName.trim()) {
        params.append('medication_name', medicationName.trim());
      }
      if (startDateFilter) {
        params.append('start_date', startDateFilter);
      }
      if (endDateFilter) {
        params.append('end_date', endDateFilter);
      }
      
      const queryString = params.toString();
      const url = `/patients/${patientId}/prescriptions${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      setPrescriptions(response.data);
    } catch (error: any) {
      console.error('Error fetching prescriptions:', error);
      setError(error?.response?.data?.detail || error?.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = async () => {
    setIsFiltering(true);
    await fetchPrescriptions(searchTerm, startDate, endDate);
    setIsFiltering(false);
  };

  const handleClearFilters = async () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setIsFiltering(true);
    await fetchPrescriptions();
    setIsFiltering(false);
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  const getMedicationFromData = (data: any) => {
    if (!data) return [];
    
    // Extract medications from the raw data structure
    if (Array.isArray(data)) {
      return data.map((item, index) => ({
        id: `med-${index}`,
        name: item.Medicamento || item.medication || 'Medicamento no especificado',
        start_date: item.Inicio || item.start_date || 'No especificada',
        dose: item.Dosis || item.dose || item.dosage || 'No especificada',
        type: item.Tipo || item.type || 'No especificada',
        frequency: item.Frecuencia || item.frequency || 'No especificada',
        quantity: item.Cantidad || item.quantity || 'No especificada',
        notes: item.Observaciones || item.notes || item.instructions || '',
        doctor_name: item.Médico || item.doctor || 'No especificada'
      }));
    }
    
    return [];
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medicamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medicamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="h-5 w-5" />
          Medicamentos
          <Badge variant="secondary">{prescriptions.length}</Badge>
        </CardTitle>
        
        {/* Search and Filter Section */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col gap-4">
            {/* Search by medication name */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Buscar medicamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isFiltering}
                size="sm"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Date filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Fecha desde:
                </label>
                <Input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Fecha hasta:
                </label>
                <Input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={handleSearch} 
                disabled={isFiltering}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                {isFiltering ? 'Buscando...' : 'Aplicar Filtros'}
              </Button>
              {(searchTerm || startDate || endDate) && (
                <Button 
                  onClick={handleClearFilters} 
                  variant="outline"
                  disabled={isFiltering}
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>
          
          {/* Show active filters */}
          {(searchTerm || startDate || endDate) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-gray-500">Filtros activos:</span>
              {searchTerm && (
                <Badge variant="outline" className="text-xs">
                  Medicamento: {searchTerm}
                </Badge>
              )}
              {startDate && (
                <Badge variant="outline" className="text-xs">
                  Desde: {new Date(startDate).toLocaleDateString('es-ES')}
                </Badge>
              )}
              {endDate && (
                <Badge variant="outline" className="text-xs">
                  Hasta: {new Date(endDate).toLocaleDateString('es-ES')}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {prescriptions.length === 0 ? (
          <div className="text-center py-8">
            <Pill className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay medicamentos registrados</p>
          </div>
        ) : (
          <div className="space-y-6">
            {prescriptions.map((prescription) => {
              const medications = getMedicationFromData(prescription.data);
              
              return (
                <div key={prescription.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formatDate(prescription.created_at)}
                      </span>
                    </div>
                    {prescription.doctor_certificate && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Dr. {prescription.doctor_certificate}
                        </span>
                      </div>
                    )}
                  </div>

                  {medications.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Medicamentos Prescritos:</h4>
                      <div className="grid gap-4">
                        {medications.map((med) => (
                          <div key={med.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">Inicio:</span> {med.start_date}
                                </div>
                              </div> 
                              <div>
                                <span className="font-medium">Nombre del medicamento:</span>{' '}
                                {med.name.length > 40 ? `${med.name.slice(0, 40)}...` : med.name}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Dosis:</span> {med.dose} {med.type}
                              </div>
                              <div>
                                <span className="font-medium">Frecuencia:</span> {med.frequency}
                              </div>
                              <div>
                                <span className="font-medium">Cantidad:</span> {med.quantity}
                              </div>
                              <div>
                                <span className="font-medium">Médico:</span> {med.doctor_name}
                              </div>
                            </div>
                            {med.notes && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Observaciones:</span> {med.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Información de medicamentos no disponible en formato estructurado
                    </div>
                  )}

                  {prescription.instructions && (
                    <div className="border-t pt-3">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Instrucciones:</p>
                          <p className="text-sm text-gray-600">{prescription.instructions}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 