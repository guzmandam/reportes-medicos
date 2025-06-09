'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, User, Stethoscope } from 'lucide-react';
import api from '@/lib/axios';
import { MedicalNote } from '@/types/patient';

interface PatientNotesProps {
  patientId: string;
}

export default function PatientNotes({ patientId }: PatientNotesProps) {
  const [notes, setNotes] = useState<MedicalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await api.get(`/patients/${patientId}/notes`);
        setNotes(response.data);
      } catch (error: any) {
        console.error('Error fetching notes:', error);
        setError(error?.response?.data?.detail || error?.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
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

  const getNoteTypeColor = (noteType?: string) => {
    switch (noteType?.toLowerCase()) {
      case 'evolución': return 'bg-blue-100 text-blue-800';
      case 'ingreso': return 'bg-green-100 text-green-800';
      case 'alta': return 'bg-purple-100 text-purple-800';
      case 'consulta': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNote = (note: any) => {
    return {
      patient_id: note.patient_id,
      id: note.id,
      created_at: note.created_at,
      note_type: note.note_type || note["TipoNota"],
      note_number: note.note_number || note["NoNota"],
      expedient_number: note.expedient_number || note["NoExpediente"],
      him: note.him || note["HIM"],
      admission_date: note.admission_date || note["FechaIngreso"],
      admission_time: note.admission_time || note["HoraIngreso"],
      discharge_time: note.discharge_time || note["HoraAlta"],
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notas Médicas
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
            <FileText className="h-5 w-5" />
            Notas Médicas
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
          <FileText className="h-5 w-5" />
          Notas Médicas
          <Badge variant="secondary">{notes.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay notas médicas registradas</p>
          </div>
        ) : (
          <div className="space-y-6">
            {notes.map((note) => {
              const formattedNote = formatNote(note);
              return (
                <div key={formattedNote.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{formatDate(formattedNote.created_at)}</span>
                      {formattedNote.note_type && (
                        <Badge className={getNoteTypeColor(formattedNote.note_type)}>
                          {formattedNote.note_type}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Número de Nota</p>
                        <p className="text-sm text-gray-600">{formattedNote.note_number}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Número de Expediente</p>
                        <p className="text-sm text-gray-600">{formattedNote.expedient_number}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">HIM</p>
                        <p className="text-sm text-gray-600">{formattedNote.him}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Fecha de Ingreso</p>
                        <p className="text-sm text-gray-600">{formattedNote.admission_date}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Hora de Ingreso</p>
                        <p className="text-sm text-gray-600">{formattedNote.admission_time}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Hora de Alta</p>
                        <p className="text-sm text-gray-600">{formattedNote.discharge_time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 