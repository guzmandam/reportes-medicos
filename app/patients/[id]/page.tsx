'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Calendar, Phone, Mail, MapPin, FileText, Pill, Activity, Utensils, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';
import { Patient } from '@/types/patient';
import PatientHeader from '@/components/patient/patient-header';
import PatientOverview from '@/components/patient/patient-overview';
import PatientPrescriptions from '@/components/patient/patient-prescriptions';
import PatientNotes from '@/components/patient/patient-notes';
import PatientVitalSigns from '@/components/patient/patient-vital-signs';
import PatientDietetic from '@/components/patient/patient-dietetic';
import PatientDocuments from '@/components/patient/patient-documents';

export default function PatientProfilePage() {
  const params = useParams();
  const patientId = params.id as string;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await api.get(`/patients/${patientId}`);
        setPatient(response.data);
      } catch (error: any) {
        console.error('Error fetching patient:', error);
        setError(error?.response?.data?.detail || error?.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información del paciente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Paciente no encontrado'}</p>
            <Link href="/patients">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Pacientes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Link href="/patients">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Perfil del Paciente</h1>
          <p className="text-gray-600">Vista detallada de la información médica</p>
        </div>
      </div>

      {/* Patient Header */}
      <PatientHeader patient={patient} />

      {/* Patient Overview */}
      <PatientOverview patient={patient} />

      {/* Tabs for detailed information */}
      <Tabs defaultValue="prescriptions" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="prescriptions" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Medicamentos
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Notas
          </TabsTrigger>
          <TabsTrigger value="vital-signs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Signos Vitales
          </TabsTrigger>
          {/* <TabsTrigger value="dietetic" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Órdenes Dietéticas
          </TabsTrigger> */}
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Documentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions" className="mt-6">
          <PatientPrescriptions patientId={patientId} />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <PatientNotes patientId={patientId} />
        </TabsContent>

        <TabsContent value="vital-signs" className="mt-6">
          <PatientVitalSigns patientId={patientId} />
        </TabsContent>

        <TabsContent value="dietetic" className="mt-6">
          <PatientDietetic patientId={patientId} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <PatientDocuments patientId={patientId} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 