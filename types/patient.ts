// Patient-related type definitions

export interface Patient {
  id: string;
  names: string;
  paternal_lastname: string;
  maternal_lastname?: string;
  date_of_birth: string;
  gender: 'Masculino' | 'Femenino' | 'Otro';
  him: string;
  id_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  doctors?: Array<{
    professional_certificate: string;
    sign_date: string;
    total_interactions: number;
  }>;
  created_at: string;
}

export interface MedicalNote {
  id: string;
  patient_id: string;
  note_type: string;
  note_number: string;
  expedient_number: string;
  him: string;
  admission_date: string;
  admission_time: string;
  discharge_time: string;
  created_at: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  note_id?: string;
  medication_name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  doctor_certificate?: string;
  document_id?: string;
  prescribed_date?: string;
  created_at: string;
  data?: any;
}

export interface VitalSigns {
  id: string;
  patient_id: string;
  note_id?: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
  measurements?: any;
  measured_by?: string;
  doctor_certificate?: string;
  document_id?: string;
  recorded_date?: string;
  created_at: string;
  data?: any;
}

export interface DieteticOrder {
  id: string;
  patient_id: string;
  note_id?: string;
  diet_type?: string;
  order_type?: string;
  description?: string;
  restrictions?: string;
  calories?: number;
  doctor_certificate?: string;
  document_id?: string;
  order_date?: string;
  created_at: string;
  data?: any;
}

export interface Document {
  id: string;
  patient_id?: string;
  filename?: string;
  file_path: string;
  file_size?: number;
  content_type?: string;
  status: string;
  processing_result?: any;
  upload_date?: string;
  processed_date?: string;
  note_number?: string;
  note_type?: string;
  record_number?: string;
  him?: string;
  hospital?: string;
  admission_date?: string;
  admission_time?: string;
  discharge_time?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
} 