'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pill, Calendar, User, FileText } from 'lucide-react';
import api from '@/lib/axios';
import { Prescription } from '@/types/patient';

interface PatientPrescriptionsProps {
  patientId: string;
}

export default function PatientPrescriptions({ patientId }: PatientPrescriptionsProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await api.get(`/patients/${patientId}/prescriptions`);
        setPrescriptions(response.data);
      } catch (error: any) {
        console.error('Error fetching prescriptions:', error);
        setError(error?.response?.data?.detail || error?.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

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
            Recetas Médicas
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
            Recetas Médicas
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
          Recetas Médicas
          <Badge variant="secondary">{prescriptions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {prescriptions.length === 0 ? (
          <div className="text-center py-8">
            <Pill className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay recetas médicas registradas</p>
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