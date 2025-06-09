'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stethoscope, Calendar, User, FileText, Download, Eye } from 'lucide-react';
import api from '@/lib/axios';
import { Document } from '@/types/patient';

interface PatientDocumentsProps {
  patientId: string;
}

export default function PatientDocuments({ patientId }: PatientDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get(`/patients/${patientId}/documents`);
        setDocuments(response.data);
      } catch (error: any) {
        console.error('Error fetching documents:', error);
        setError(error?.response?.data?.detail || error?.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'analyzed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'analyzed': return 'Analizado';
      case 'processing': return 'Procesando';
      case 'pending': return 'Pendiente';
      case 'error': return 'Error';
      default: return status;
    }
  };

  const getNoteTypeColor = (noteType: string) => {
    switch (noteType?.toLowerCase()) {
      case 'evolución': return 'bg-blue-100 text-blue-800';
      case 'ingreso': return 'bg-green-100 text-green-800';
      case 'alta': return 'bg-purple-100 text-purple-800';
      case 'consulta': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await api.get(`/documents/${doc.id}/download`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `documento_${doc.note_number || doc.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Documentos Médicos
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
            <Stethoscope className="h-5 w-5" />
            Documentos Médicos
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
          <Stethoscope className="h-5 w-5" />
          Documentos Médicos
          <Badge variant="secondary">{documents.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay documentos médicos registrados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((document) => (
              <div key={document.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900">
                        Nota #{document.note_number}
                      </h4>
                      <Badge className={getNoteTypeColor(document?.note_type || '')}>
                        {document.note_type}
                      </Badge>
                      <Badge className={getStatusColor(document.status)}>
                        {getStatusLabel(document.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      {document.record_number && (
                        <div>
                          <span className="font-medium">Expediente:</span> {document.record_number}
                        </div>
                      )}
                      {document.hospital && (
                        <div>
                          <span className="font-medium">Hospital:</span> {document.hospital}
                        </div>
                      )}
                      {document.admission_date && (
                        <div>
                          <span className="font-medium">Fecha Ingreso:</span> {document.admission_date}
                          {document.admission_time && ` ${document.admission_time}`}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                                         <Button
                       variant="outline"
                       size="sm"
                       onClick={() => handleDownload(document)}
                       className="flex items-center gap-1"
                     >
                      <Download className="h-4 w-4" />
                      Descargar
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Subido: {formatDate(document.created_at)}</span>
                  </div>
                  
                  {document.discharge_time && (
                    <div>
                      <span className="font-medium">Hora Alta:</span> {document.discharge_time}
                    </div>
                  )}
                </div>

                {document.status === 'analyzed' && (
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">
                        Documento procesado y datos extraídos exitosamente
                      </span>
                    </div>
                  </div>
                )}

                {document.status === 'processing' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                      <span className="text-sm text-yellow-800">
                        Procesando documento...
                      </span>
                    </div>
                  </div>
                )}

                {document.status === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-800">
                        Error al procesar el documento
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 