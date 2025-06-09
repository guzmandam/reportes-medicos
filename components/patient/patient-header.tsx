'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, IdCard, Heart } from 'lucide-react';
import { Patient } from '@/types/patient';

interface PatientHeaderProps {
  patient: Patient;
}

const getGenderColor = (gender: string) => {
  switch (gender) {
    case 'Masculino': return 'bg-blue-100 text-blue-800';
    case 'Femenino': return 'bg-pink-100 text-pink-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getGenderLabel = (gender: string) => {
  switch (gender) {
    case 'Masculino': return 'Masculino';
    case 'Femenino': return 'Femenino';
    default: return 'Otro';
  }
};

const getFullName = (patient: Patient) => {
  return `${patient.names} ${patient.paternal_lastname}${patient.maternal_lastname ? ` ${patient.maternal_lastname}` : ''}`;
};

const getInitials = (patient: Patient) => {
  const names = patient.names.split(' ');
  const firstInitial = names[0]?.charAt(0) || '';
  const lastInitial = patient.paternal_lastname?.charAt(0) || '';
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

const calculateAge = (dateOfBirth: string) => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

export default function PatientHeader({ patient }: PatientHeaderProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-6">
          {/* Patient Avatar */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-800">
                {getInitials(patient)}
              </span>
            </div>
          </div>

          {/* Patient Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {getFullName(patient)}
              </h2>
              <p className="text-lg text-gray-600 mt-1">
                {calculateAge(patient.date_of_birth)} años
              </p>
            </div>

            {/* Key Information */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <IdCard className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">HIM</p>
                  <p className="font-semibold">{patient.him}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Género</p>
                  <Badge className={getGenderColor(patient.gender)}>
                    {getGenderLabel(patient.gender)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                  <p className="font-semibold">
                    {new Date(patient.date_of_birth).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Médicos Asociados</p>
                  <p className="font-semibold">
                    {patient.doctors?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 