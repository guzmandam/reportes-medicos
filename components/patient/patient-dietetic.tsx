'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Utensils, Calendar, User, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import { DieteticOrder } from '@/types/patient';

interface PatientDieteticProps {
  patientId: string;
}

export default function PatientDietetic({ patientId }: PatientDieteticProps) {
  const [dietticOrders, setDietticOrders] = useState<DieteticOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDietticOrders = async () => {
      try {
        const response = await api.get(`/patients/${patientId}/dietetic-orders`);
        setDietticOrders(response.data);
      } catch (error: any) {
        console.error('Error fetching dietetic orders:', error);
        setError(error?.response?.data?.detail || error?.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchDietticOrders();
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

  const getDieteticOrdersFromData = (data: any) => {
    if (!data) return [];
    
    // Extract dietetic orders from the raw data structure
    if (Array.isArray(data)) {
      return data.map((item, index) => ({
        id: `diet-${index}`,
        type: item.Concepto || item.type || 'Orden Dietética',
        description: item.Descripcion || item.description || item.Valor || 'No especificada',
        time: item.Hora || item.time || '',
        notes: item.Observaciones || item.notes || ''
      }));
    }
    
    return [];
  };

  const getDietTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('hipocalórica') || lowerType.includes('baja')) {
      return 'bg-red-100 text-red-800';
    }
    if (lowerType.includes('hipercalórica') || lowerType.includes('alta')) {
      return 'bg-green-100 text-green-800';
    }
    if (lowerType.includes('diabética') || lowerType.includes('diabetes')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (lowerType.includes('líquida') || lowerType.includes('líquidos')) {
      return 'bg-cyan-100 text-cyan-800';
    }
    if (lowerType.includes('blanda') || lowerType.includes('suave')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (lowerType.includes('normal') || lowerType.includes('general')) {
      return 'bg-gray-100 text-gray-800';
    }
    return 'bg-orange-100 text-orange-800';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Órdenes Dietéticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
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
            <Utensils className="h-5 w-5" />
            Órdenes Dietéticas
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
          <Utensils className="h-5 w-5" />
          Órdenes Dietéticas
          <Badge variant="secondary">{dietticOrders.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {dietticOrders.length === 0 ? (
          <div className="text-center py-8">
            <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay órdenes dietéticas registradas</p>
          </div>
        ) : (
          <div className="space-y-6">
            {dietticOrders.map((order) => {
              const dietOrders = getDieteticOrdersFromData(order.data);
              
              return (
                <div key={order.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                    {order.doctor_certificate && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Dr. {order.doctor_certificate}
                        </span>
                      </div>
                    )}
                  </div>

                  {dietOrders.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Órdenes Dietéticas:</h4>
                      <div className="space-y-3">
                        {dietOrders.map((dietOrder) => (
                          <div key={dietOrder.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Utensils className="h-4 w-4 text-orange-600" />
                                <h5 className="font-medium text-gray-900">{dietOrder.type}</h5>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getDietTypeColor(dietOrder.type)}>
                                  {dietOrder.type}
                                </Badge>
                                {dietOrder.time && (
                                  <span className="text-xs text-gray-500">{dietOrder.time}</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm font-medium text-gray-700">Descripción:</span>
                                <p className="text-sm text-gray-600">{dietOrder.description}</p>
                              </div>
                              
                              {dietOrder.notes && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Observaciones:</span>
                                  <p className="text-sm text-gray-600">{dietOrder.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Información de órdenes dietéticas no disponible en formato estructurado
                    </div>
                  )}

                  {order.order_type && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Utensils className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Tipo de Orden:</span>
                      </div>
                      <p className="text-sm text-gray-700">{order.order_type}</p>
                    </div>
                  )}

                  {order.description && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h5 className="font-medium text-gray-900 mb-2">Descripción General:</h5>
                      <p className="text-sm text-gray-700">{order.description}</p>
                    </div>
                  )}

                  {order.restrictions && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-900">Restricciones:</span>
                      </div>
                      <p className="text-sm text-red-700">{order.restrictions}</p>
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