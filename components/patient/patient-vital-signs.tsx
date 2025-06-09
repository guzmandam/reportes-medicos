'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Calendar, User, Heart, Thermometer, Eye } from 'lucide-react';
import api from '@/lib/axios';
import { VitalSigns } from '@/types/patient';

interface PatientVitalSignsProps {
  patientId: string;
}

export default function PatientVitalSigns({ patientId }: PatientVitalSignsProps) {
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVitalSigns = async () => {
      try {
        const response = await api.get(`/patients/${patientId}/vital-signs`);
        setVitalSigns(response.data);
      } catch (error: any) {
        console.error('Error fetching vital signs:', error);
        setError(error?.response?.data?.detail || error?.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchVitalSigns();
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

  const getVitalSignsFromData = (data: any) => {
    if (!data) return [];
    
    // Extract vital signs from the raw data structure
    if (Array.isArray(data)) {
      return data.map((item, index) => ({
        id: `vital-${index}`,
        timestamp: item["Fecha/Hora"] || item.timestamp || 'No especificada',
        fr: item["FR"] || item.fr || 'No especificada',
        fc: item["FC"] || item.fc || 'No especificada',
        pas: item["PAS"] || item.pas || 'No especificada',
        pad: item["PAD"] || item.pad || 'No especificada',
        spo2: item["SAT_O2"] || item.spo2 || 'No especificada',
        temp: item["Temp_°C"] || item.temp || 'No especificada',
        weight: item["Peso"] || item.weight || 'No especificada',
        height: item["Talla"] || item.height || 'No especificada'
      }));
    }
    
    return [];
  };

  const getVitalSignIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('presión') || lowerType.includes('pa')) {
      return <Heart className="h-4 w-4 text-red-500" />;
    }
    if (lowerType.includes('temperatura') || lowerType.includes('temp')) {
      return <Thermometer className="h-4 w-4 text-orange-500" />;
    }
    if (lowerType.includes('frecuencia') || lowerType.includes('fc')) {
      return <Activity className="h-4 w-4 text-blue-500" />;
    }
    if (lowerType.includes('saturación') || lowerType.includes('spo2')) {
      return <Eye className="h-4 w-4 text-green-500" />;
    }
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getVitalSignColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('presión') || lowerType.includes('pa')) {
      return 'bg-red-50 border-red-200';
    }
    if (lowerType.includes('temperatura') || lowerType.includes('temp')) {
      return 'bg-orange-50 border-orange-200';
    }
    if (lowerType.includes('frecuencia') || lowerType.includes('fc')) {
      return 'bg-blue-50 border-blue-200';
    }
    if (lowerType.includes('saturación') || lowerType.includes('spo2')) {
      return 'bg-green-50 border-green-200';
    }
    return 'bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Signos Vitales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
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
            <Activity className="h-5 w-5" />
            Signos Vitales
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
          <Activity className="h-5 w-5" />
          Signos Vitales
          <Badge variant="secondary">{vitalSigns.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {vitalSigns.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay signos vitales registrados</p>
          </div>
        ) : (
          <div className="space-y-6">
            {vitalSigns.map((vitalSign) => {
              const measurements = getVitalSignsFromData(vitalSign.data);
              
              return (
                <div key={vitalSign.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formatDate(vitalSign.created_at)}
                      </span>
                    </div>
                    {vitalSign.doctor_certificate && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Dr. {vitalSign.doctor_certificate}
                        </span>
                      </div>
                    )}
                  </div>

                  {measurements.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Mediciones:</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50 border-b">
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Fecha/Hora</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">FR</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">FC</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">PAS</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">PAD</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">SpO2</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Temp</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Peso</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Talla</th>
                            </tr>
                          </thead>
                          <tbody>
                            {measurements.map((measurement) => (
                              <tr key={measurement.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">{measurement.timestamp}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{measurement.fr}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{measurement.fc}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{measurement.pas}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{measurement.pad}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{measurement.spo2}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{measurement.temp}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{measurement.weight}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{measurement.height}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Información de signos vitales no disponible en formato estructurado
                    </div>
                  )}

                  {vitalSign.measured_by && (
                    <div className="border-t pt-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Medido por: {vitalSign.measured_by}
                        </span>
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