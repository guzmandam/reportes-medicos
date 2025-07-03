'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Pill, Activity, Utensils, Phone, Mail, MapPin } from 'lucide-react';
import api from '@/lib/axios';
import { Patient } from '@/types/patient';

interface PatientOverviewProps {
  patient: Patient;
}

interface OverviewStats {
  notes: number;
  prescriptions: number;
  vitalSigns: number;
  dietticOrders: number;
}

export default function PatientOverview({ patient }: PatientOverviewProps) {
  const [stats, setStats] = useState<OverviewStats>({
    notes: 0,
    prescriptions: 0,
    vitalSigns: 0,
    dietticOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all stats in parallel
        const [notesRes, prescriptionsRes, vitalSignsRes, dietticOrdersRes] = await Promise.all([
          api.get(`/patients/${patient.id}/notes`).catch(() => ({ data: [] })),
          api.get(`/patients/${patient.id}/prescriptions`).catch(() => ({ data: [] })),
          api.get(`/patients/${patient.id}/vital-signs`).catch(() => ({ data: [] })),
          api.get(`/patients/${patient.id}/dietetic-orders`).catch(() => ({ data: [] })),
        ]);

        setStats({
          notes: notesRes.data.length,
          prescriptions: prescriptionsRes.data.length,
          vitalSigns: vitalSignsRes.data.length,
          dietticOrders: dietticOrdersRes.data.length,
        });
      } catch (error) {
        console.error('Error fetching overview stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [patient.id]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Resumen Médico
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{stats.notes}</p>
                <p className="text-sm text-gray-600">Notas Médicas</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Pill className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{stats.prescriptions}</p>
                <p className="text-sm text-gray-600">Medicamentos</p>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <Activity className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{stats.vitalSigns}</p>
                <p className="text-sm text-gray-600">Signos Vitales</p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Utensils className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">{stats.dietticOrders}</p>
                <p className="text-sm text-gray-600">Órdenes Dietéticas</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {patient.id_number && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">#</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cédula de Identidad</p>
                <p className="font-medium">{patient.id_number}</p>
              </div>
            </div>
          )}

          {patient.phone && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Phone className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-medium">{patient.phone}</p>
              </div>
            </div>
          )}

          {patient.email && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Mail className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{patient.email}</p>
              </div>
            </div>
          )}

          {patient.address && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Dirección</p>
                <p className="font-medium">{patient.address}</p>
              </div>
            </div>
          )}

          {!patient.phone && !patient.email && !patient.address && !patient.id_number && (
            <p className="text-gray-500 text-center py-4">
              No hay información de contacto disponible
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 