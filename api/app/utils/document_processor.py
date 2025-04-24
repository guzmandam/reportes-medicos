import os
from datetime import datetime
from typing import Dict, Any, Optional

import pandas as pd
from pydantic import BaseModel

from .helpers import Utils, HeaderFooterToDf, ExtractTables

class StructuredData(BaseModel):
    patient: dict
    doctor: dict
    note: dict
    vital_signs: dict
    active_diagnostics: dict
    dietetic_orders: dict
    nursing_orders: dict
    prescriptions: dict

class DocumentProcessor:
    """
    Utility class for processing documents (PDF files)
    
    This class is responsible for:
    1. Converting PDF to images
    2. Extracting text using OCR
    3. Processing text to extract structured data
    4. Returning processed information
    """
    diagnosticos_activos_lst = ['Fecha_Ingresada', 'Descripción', 'Tipo', 'Médico']
    ordenes_dieteticas_lst = ['Fecha_Ingresada', 'Tipo', 'Tipo_terapéutico',]
    ordenes_enfermeria_lst = ['Fecha_Ingresada', 'Orden', 'Médico']
    signos_vitales_lst = ['Fecha/Hora', 'FR', 'FC', 'PAS', 'PAD', 'SAT_O2', 'Temp_°C', 'Peso', 'Talla']
    medicamentos_hospitalarios_lst = ['Inicio', 'Medicamento', 'Frecuencia', 'Via', 'Dosis', 'UDM', 'Cantidad', 'Tipo', 'Médico']
        
    def __init__(self, file_path: str):
        """Initialize the document processor with a file path"""
        self.file_path = file_path
        self.extracted_text = ""

        self.note_info = {}
        self.patient_info = {}
        self.med_info = {}
        self.diagnosticos_activos = {}
        self.ordenes_dieteticas = {}
        self.ordenes_enfermeria = {}
        self.signos_vitales = {}
        self.medicamentos_hospitalarios = {}
    
    # Función para convertir DataFrame a diccionario con las columnas requeridas 
    def __df_to_dict(self, df, columns):
        if df.empty:
            return []
        
        df = df.rename(columns={col: col.replace(" ", "_") for col in df.columns})  # Limpia espacios

        data = []
        for _, row in df.iterrows():
            item = {col: row.get(col, '') for col in columns}
            data.append(item)
        
        return data

    # Extraer el header y footer del texto extraído
    def __get_header_footer(self, text):
        df_head = HeaderFooterToDf.get_head(text, pd.DataFrame(columns=['No_nota', 'Tipo_nota', 'No_Expediente', 'HIM']))
        df_name = HeaderFooterToDf.get_patient_data(text, pd.DataFrame(columns=['Apellido_paterno', 'Apellido_materno', 'Nombres', 'Fecha_nacimiento', 'Sexo', 'Edad']))
        df_medical = HeaderFooterToDf.get_medical_data(text, pd.DataFrame(columns=['Fecha_ingreso','Hora_ingreso','Hora_alta','Firmado_por', 'Cedula_profesional','Fecha_creacion','Hora_creacion', 'Hospital']))

        # Comprobamos si los DataFrames no están vacíos antes de extraer los primeros registros
        head = df_head.iloc[0].to_dict() if not df_head.empty else {}
        patient_data = df_name.iloc[0].to_dict() if not df_name.empty else {}
        medical = df_medical.iloc[0].to_dict() if not df_medical.empty else {}

        # Combinar los diccionarios en uno solo
        header_footer = {**head, **patient_data, **medical}
        return header_footer
        
    # Función para manejar la extracción de datos 
    def __extract_and_validate(self, texto_extraido, seccion, columns):
        df = ExtractTables.extraer_tabla(texto_extraido, seccion)
        return self.__df_to_dict(df, columns)

    async def extract_text(self) -> str:
        """
        Extract text from PDF document
        """
        self.extracted_text = Utils.get_text_from_pdf(self.file_path)
        return self.extracted_text
    
    async def process_text(self) -> Dict[str, Any]:
        """
        Process extracted text to identify entities and structured data
        """
        # Make sure text is extracted
        if not self.extracted_text:
            await self.extract_text()

        # Obtener los datos
        header_footer = self.__get_header_footer(self.extracted_text)

        signos_vitales = Utils.get_signos_vitales(self.extracted_text)
        tabla_signos_vitales = self.__extract_and_validate(self.extracted_text, "Signos Vitales", self.signos_vitales_lst)

        diagnosticos_activos = Utils.get_diagnosticos_activos(self.extracted_text)
        tabla_diagnosticos_activos = self.__extract_and_validate(self.extracted_text, "Diagnósticos Activos", self.diagnosticos_activos_lst)

        tabla_ordenes_dieteticas = self.__extract_and_validate(self.extracted_text, "Órdenes de Dietéticas Activas", self.ordenes_dieteticas_lst)
        tabla_ordenes_enfermeria = self.__extract_and_validate(self.extracted_text, "Órdenes de Enfermería Activas", self.ordenes_enfermeria_lst)
        tabla_medicamentos_hospitalarios = self.__extract_and_validate(self.extracted_text, "Órdenes de Medicamentos Hospitalarios", self.medicamentos_hospitalarios_lst)
            
        self.note_info = {
            "NoNota": header_footer.get("No_nota", ""),
            "TipoNota": header_footer.get("Tipo_nota", ""),
            "NoExpediente": header_footer.get("No_expediente", ""),
            "HIM": header_footer.get("HIM", ""),
            "FechaIngreso": header_footer.get("Fecha_ingreso", ""),
            "HoraIngreso": header_footer.get("Hora_ingreso", ""),
            "HoraAlta": header_footer.get("Hora_alta", ""),
        }

        self.patient_info = {
            "ApellidoPaterno": header_footer.get("Apellido_paterno", ""),
            "ApellidoMaterno": header_footer.get("Apellido_materno", ""),
            "Nombres": header_footer.get("Nombres", ""),
            "FechaNacimiento": header_footer.get("Fecha_nacimiento", ""),
            "Sexo": header_footer.get("Sexo", ""),
            "HIM": header_footer.get("HIM", "")
        }

        self.med_info = {
            "NombreCompleto": header_footer.get("Nombre_Completo", ""),
            "FirmadoPor": header_footer.get("Firmado_por", ""),
            "Supervisor": header_footer.get("Supervisor_nombre", ""),
            "CedulaProfesional": header_footer.get("Cedula_profesional", ""),
            "FechaCreacion": header_footer.get("Fecha_creacion", ""),
            "HoraCreacion": header_footer.get("Hora_creacion", ""),
        }

        self.signos_vitales = {
            "Tabla": tabla_signos_vitales,
            "Subjetivo": signos_vitales.get("Subjetivo", ""),
        }

        self.diagnostico_activo = {
            "Notas": diagnosticos_activos.get("Notas", ""),
            "ExamenFisico": diagnosticos_activos.get("Examen Físico", ""),
            "DiagnosticosActivosTabla": tabla_diagnosticos_activos,
            "AnalisisCondicion": diagnosticos_activos.get("Análisis/Condición", ""),
            "Estudios": diagnosticos_activos.get("Comentar estudio(s)", ""),
            "PlanTratamiento": diagnosticos_activos.get("Plan de Tratamiento", ""),
        }

        self.ordenes_dieteticas = {
            "Tabla": tabla_ordenes_dieteticas,
        }
        
        self.ordenes_enfermeria = {
            "Tabla": tabla_ordenes_enfermeria,
        }

        self.medicamentos_hospitalarios = {
            "Tabla": tabla_medicamentos_hospitalarios,
        }
    
    async def analyze(self) -> Dict[str, Any]:
        """
        Main method to analyze a document
        
        Performs the complete pipeline:
        1. Extract text
        2. Process text
        3. Return structured data
        """
        await self.extract_text()
        await self.process_text()

        structured_data = StructuredData(
            patient=self.patient_info,
            doctor=self.med_info,
            note=self.note_info,
            vital_signs=self.signos_vitales,
            active_diagnostics=self.diagnostico_activo,
            dietetic_orders=self.ordenes_dieteticas,
            nursing_orders=self.ordenes_enfermeria,
            prescriptions=self.medicamentos_hospitalarios,
        )

        return structured_data
