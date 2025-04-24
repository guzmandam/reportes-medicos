from PyPDF2 import PdfReader
import pandas as pd
import re

class Utils:
    def __init__(self):
        pass
    
    @staticmethod
    def get_text_from_pdf(pdf_path):
        # Load the PDF
        reader = PdfReader(pdf_path)

        total_text = ''

        # Extract text from each page
        for i, page in enumerate(reader.pages):
            total_text += page.extract_text()

        return total_text

    @staticmethod
    def get_signos_vitales(text):
        """ Takes as input the text of the "Signos Vitales" section obtained by OCR
            and divides it into the sections "Subjetivo" y "Signos" and returns
            their content.
        """
        section_start = text.find("Signos Vitales - Últimas 24 horas")

        if section_start == -1:
            section_start = text.find("Subjetivo")

        text = text[section_start:]

        section_end = text.find("Diagnósticos Activos")
        text = text[:section_end]

        # find position in input string where Subjetivo section starts
        subjetivo_start = text.find("Subjetivo")

        # pass text that comes before "Subjetivo" to Diego's function (diegos_func)
        # and obtain a dataframe with the table contents
        signos_df = ExtractTables.extraer_tabla(text, "Signos Vitales")

        # assign text that comes after "Subjetivo" to a variable
        subjetivo_text = text[subjetivo_start:]

        return {"Signos": signos_df, "Subjetivo": subjetivo_text}

    @staticmethod
    def get_diagnosticos_para_excel(pdf_path):
        total_text = Utils.get_text_from_pdf(pdf_path)
        
        subjetivo_text = Utils.get_signos_vitales(total_text)["Subjetivo"]
        
        # diagnostics are listed with "-" bullet points
        # split up the diagnostics and safe them to a df so that each line has
        # one diagnostic
        diagnostics_list = subjetivo_text.split("-")
        
        # count number of times "-" appears in the text
        num_diagnostics = subjetivo_text.count("-")
        print(num_diagnostics)

        if len(diagnostics_list) > num_diagnostics:
            # delete the first entry (the text that comes before the "-")
            del diagnostics_list[0]

        assert len(diagnostics_list) == num_diagnostics

        diagnostics_df = pd.DataFrame(diagnostics_list, columns=["Diagnostico"])
        print(diagnostics_df)
        return diagnostics_df
        
    @staticmethod
    def get_diagnosticos_activos(text):
        """ Takes as input the text of the "Diagnósticos Activos" section obtained by OCR
            and divides it into the sub-sections and returns their content as a dict.
        """
        diag_activos_start = text.find("Diagnósticos Activos")
        text = text[diag_activos_start:]

        section_end = text.find("Órdenes de Dietéticas Activas")
        text = text[:section_end]

        examen_fisico_start = text.find("Examen Físico")
        analisis_start = text.find("Análisis/Condición")

        # Get a subsection for the Notas section
        notas_text = text[examen_fisico_start:analisis_start]
        notas_start = notas_text.find("Notas")
        notas_text = notas_text[notas_start:]

        estudios_start = text.find("Comentar estudio(s)")
        plan_start = text.find("Plan de Tratamiento")

        diagnosticos_activos_df = ExtractTables.extraer_tabla(text, "Diagnósticos Activos")

        # Split the text by the header names
        examen_fisico_text = text[examen_fisico_start:notas_start]
        analisis_text = text[analisis_start:estudios_start]
        estudios_text = text[estudios_start:plan_start]
        plan_text = text[plan_start:]

        return {"Diagnósticos Activos": diagnosticos_activos_df,
                "Examen Físico": examen_fisico_text,
                "Notas": notas_text,
                "Análisis/Condición": analisis_text,
                "Comentar estudio(s)": estudios_text,
                "Plan de Tratamiento": plan_text}

class HeaderFooterToDf:
    def __init__(self):
        pass
    
    @staticmethod
    def capitalize_first_letter(text):
        return ' '.join([word.capitalize() for word in text.split()])

    @staticmethod
    def get_head(text,df):
        """
        Extracts specific IDs from the given text and
        appends them to the provided DataFrame.

        Parameters:
        text (str): The input text from which to extract the IDs.
        df (pd.DataFrame): The DataFrame to which the extracted data will be added.

        Returns:
        pd.DataFrame: Updated DataFrame with the extracted IDs.
        """
        # Extract 'Numero de Nota' (Note Number)
        re_no_nota = r"\nNo.\s*([\d]+)"
        no_nota_match = re.findall(re_no_nota, text)
        no_nota = no_nota_match[0] if no_nota_match else None

        # Extract 'Tipo de Nota' (second line in the text)
        re_tipo_nota = r"(.+)\s*Derechos de Autor"
        tipo_nota_match = re.search(re_tipo_nota, text)
        tipo_nota = tipo_nota_match.group(1).strip() if tipo_nota_match else None


        # Extract 'Numero de Expediente' (Case Number)
        re_no_expediente = r"Expediente:\s*([\d]+)"
        no_expediente_match = re.findall(re_no_expediente, text)
        no_expediente = no_expediente_match[0] if no_expediente_match else None

        # Extract 'HIM' identifier
        re_him = r"HIM:\s*([\d]+)"
        him_match = re.findall(re_him, text)
        him = him_match[0] if him_match else None

        # Add extracted data to the DataFrame
        new_row = {
            'No_nota': no_nota,
            'Tipo_nota': tipo_nota,
            'No_Expediente': no_expediente,
            'HIM': him
        }

        df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)

        return df

    @staticmethod
    def get_patient_data(text, df):
        """
        Extracts patient data such as full name, birth date, gender, and age from the given text
        and appends the information to the provided DataFrame.

        Parameters:
        text (str): The input text containing patient information.
        df (pd.DataFrame): The existing DataFrame to which the extracted data will be added.

        Returns:
        pd.DataFrame: Updated DataFrame with the extracted patient data.
        """

        # Extract the full name by replacing the HIM number with "Nombre Completo" in the text
        re_him = r"HIM:\s*([\d]+)"
        new_header = re.sub(re_him, r" Nombre Completo: ", text)
        re_name = r"Nombre Completo:\s*(.*?)Fecha"
        name_match = re.findall(re_name, new_header)
        full_name = name_match[0].strip() if name_match else None

        # Split the full name into father's last name, mother's last name, and given names
        if full_name:
            name_parts = full_name.split()
            father_last_name = name_parts[0] if len(name_parts) > 0 else None
            mother_last_name = name_parts[1] if len(name_parts) > 1 else None
            mother_last_name = mother_last_name.replace(",", "").strip()
            names = " ".join(name_parts[2:]) if len(name_parts) > 2 else None
        else:
            father_last_name, mother_last_name, names = None, None, None

        # Extract birth date
        re_birth_date = r"Fecha de Nacimiento:\s*(\d{2}/\d{2}/\d{4})"
        birth_date_match = re.findall(re_birth_date, text)
        birth_date = birth_date_match[0] if birth_date_match else None

        # Extract gender
        re_sex = r"\b(Femenino|Masculino)\b"
        sex_match = re.findall(re_sex, text)
        sex = sex_match[0] if sex_match else None

        # Extract age (supporting days, months, and years)
        re_age = r"(?:Femenino|Masculino)\s*\((\d+)\s*(años|meses|días?)\)"
        age_match = re.findall(re_age, text)
        edad = f"{age_match[0][0]} {age_match[0][1]}" if age_match else None

        # Capitalize names properly
        father_last_name = HeaderFooterToDf.capitalize_first_letter(father_last_name)
        mother_last_name = HeaderFooterToDf.capitalize_first_letter(mother_last_name)
        names = HeaderFooterToDf.capitalize_first_letter(names)

        # Add extracted data to the DataFrame
        new_data = {
            'Apellido_paterno': father_last_name,
            'Apellido_materno': mother_last_name,
            'Nombres': names,
            'Fecha_nacimiento': birth_date,
            'Sexo': sex,
            'Edad': edad  # Now includes both number and unit (e.g., "3 meses", "1 año", "5 días")
        }

        df = pd.concat([df, pd.DataFrame([new_data])], ignore_index=True)
        return df

    @staticmethod
    def get_medical_data(text,df):
        """
        Extracts medical information from the given text and updates the first row of the DataFrame.
        If new columns do not exist in the DataFrame, they will be added.

        Parameters:
        text (str): The input text containing medical information.
        df (pd.DataFrame): The existing DataFrame to which the extracted data will be added.

        Returns:
        pd.DataFrame: Updated DataFrame with the extracted medical data in the first row.
        """

        # Extract the hospital admission date
        re_entry_date = r"Fecha de Ingreso:\s*(\d{2}/\d{2}/\d{4})"
        entry_date_match = re.findall(re_entry_date, text)
        entry_date = entry_date_match[0] if entry_date_match else None

        # Extract the hospital admission time
        re_entry_time = r"Fecha de Ingreso:\s*(\d{2}/\d{2}/\d{4})\s*(\d{2}:\d{2})"
        entry_time_match = re.findall(re_entry_time, text)
        entry_time = entry_time_match[0][1] if entry_time_match else None

        # Extract the hospital discharge date
        re_discharge_date = r"Dado de Alta:\s*(\d{2}/\d{2}/\d{4})"
        discharge_date_match = re.findall(re_discharge_date, text)
        discharge_date = discharge_date_match[0] if discharge_date_match else None

        # Extract the hospital discharge time
        re_discharge_time = r"Dado de Alta:\s*(\d{2}/\d{2}/\d{4})\s*(\d{2}:\d{2})"
        discharge_time_match = re.findall(re_discharge_time, text)
        discharge_time = discharge_time_match[0][1] if discharge_time_match else None

        # Extract the doctor's name who signed the medical note
        re_dc_name = r"Firmado por:\s*(.*?)-"
        dc_name_match = re.findall(re_dc_name, text)
        dc_name = dc_name_match[0] if dc_name_match else ""
        # Quitamos espacios extras
        dc_name = re.sub(r'\s+', ' ', dc_name).strip()
        dc_name = HeaderFooterToDf.capitalize_first_letter(dc_name)

        # Extract the doctor's professional license number
        re_dc_number =  r"PROF.:\s*([\d]+)"
        dc_number_match = re.findall(re_dc_number, text)
        dc_number = dc_number_match[0] if dc_number_match else None

        # Extract the creation date of the medical note
        new_header = re.sub(re_dc_name, r"Creacion: ", text)

        re_creation_date = r"Creacion:\s*(\d{2}/\d{2}/\d{4})"
        creation_date_match = re.findall(re_creation_date, new_header)
        creation_date = creation_date_match[0] if creation_date_match else None

        # Extract the creation time of the medical note
        re_creation_time = r"Creacion:\s*(\d{2}/\d{2}/\d{4})\s*(\d{2}:\d{2})"
        creation_time_match = re.findall(re_creation_time, new_header)
        creation_time = creation_time_match[0][1] if creation_time_match else None

        # Extract the hospital name
        re_hospital_name = r"Hospital\s*(.*?)\n"
        hospital_name_match = re.findall(re_hospital_name, text)
        hospital_name = "Hospital " + hospital_name_match[0] if hospital_name_match else None

        # Add extracted data to the DataFrame

        new_data = {
            'Fecha_ingreso': entry_date,
            'Hora_ingreso': entry_time,
            'Fecha_alta': discharge_date,
            'Hora_alta': discharge_time,
            'Firmado_por': dc_name,
            'Cedula_profesional': dc_number,
            'Fecha_creacion': creation_date,
            'Hora_creacion': creation_time,
            'Hospital': hospital_name
        }

        # Add new columns to the DataFrame if they do not exist
        for key in new_data.keys():
            if key not in df.columns:
                df[key] = None  # Add new columns with default None values

        # Update the first row with extracted data
        for key, value in new_data.items():
            df.at[0, key] = value

        return df

    @staticmethod
    def convert_to_df(text_list):
        """
        Converts the header and footer of a PDF file into a DataFrame
        with patient personal and medical information.

        Parameters:
        text_list (list): A list containing the extracted text segments from the PDF.

        Returns:
        pd.DataFrame: A DataFrame containing extracted patient and medical details.
        """
        # Initialize an empty DataFrame
        final_df = pd.DataFrame()

        # Combine the last 6 elements of the text list into a single string
        text = "\n".join(text_list[-6:])

        # Extract relevant data and populate the DataFrame
        final_df = HeaderFooterToDf.get_head(text, final_df)
        final_df = HeaderFooterToDf.get_patient_data(text, final_df)
        final_df = HeaderFooterToDf.get_medical_data(text, final_df)

        return final_df

class ExtractTables:
    def __init__(self):
        pass
    
    @staticmethod
    def pdf_a_texto(ruta):
        reader = PdfReader(ruta)
        documento = ""
        for pagina in range(len(reader.pages)):
            documento = documento + reader.pages[pagina].extract_text()
        return documento
    

    @staticmethod
    def get_medicamentos(rutas):
        return ExtractTables.extract_tables_from_routes(rutas, "Órdenes de Medicamentos Hospitalarios")


    @staticmethod
    def extract_tables_from_routes(rutas, seccion):
        tablas = []

        for ruta in rutas:
            documento = ExtractTables.pdf_a_texto(ruta)
            df = ExtractTables.extraer_tabla(documento, seccion)
            tablas.append(df)

        df_ejemplo =  pd.concat(tablas, ignore_index=True)
        
        return df_ejemplo.drop_duplicates().reset_index(drop=True)

    @staticmethod
    def extract_fecha(renglon):
        fecha = ""
        for n in range(17):
            fecha = fecha + renglon[n]  
        return fecha[:-1]
    
    @staticmethod
    def econtrar_seccion(lst, seccion):
        Bandera = False
        lst_resultado = []
        for i in lst:
            if(Bandera):
                if(i == ' '):
                    Bandera = False
                else:
                    date_pattern = re.compile(r"\d{2}/\d{2}/\d{4} \d{2}:\d{2}")
                    match = date_pattern.search(i)
                    if not(match is None):
                        lst_resultado.append(i)
                    else:
                        n = lst.index(i)
                        match1 = date_pattern.search(lst[n-1])
                        match2 = date_pattern.search(lst[n+1])
                        if ((not(match1 is None))&(not(match2 is None))):
                            lst_resultado.pop()
            if (i.startswith(seccion)):
                Bandera = True
        return lst_resultado
    
    @staticmethod
    def eliminar_ruido(lst):
        lista_guardado = []
        lista_resultado = []
        elemento_append = True
        for renglon in lst:
            if (renglon.startswith("Expediente:"))|("Derechos de Autor" in renglon):
                elemento_append = not(elemento_append)
                if ("Derechos de Autor" in renglon):
                    lista_guardado.append(not(elemento_append))
                else:
                    lista_guardado.append(elemento_append)
            else:
                lista_guardado.append(elemento_append)
        for i in range(len(lst)):
            if lista_guardado[i]:
                lista_resultado.append(lst[i])
        return lista_resultado
    
    @staticmethod
    def comprobacion_final(tabla, columnas):
        No_Valido = False
        for i in tabla:
            if len(i) != len(columnas):
                No_Valido = True
        if No_Valido:
            df = pd.DataFrame(columns=columnas)
        else:
            df = pd.DataFrame(tabla, columns=columnas)   
        return df

    @staticmethod
    def extraer_tabla(documento_txt, nombre_seccion):
        lst_documento = documento_txt.split('\n')
        lst_documento = ExtractTables.eliminar_ruido(lst_documento)
        tabla_seccion = ExtractTables.econtrar_seccion(lst_documento, "Órdenes de Dietéticas Activas")
        
        match nombre_seccion:
            case "Signos Vitales":
                columns = ['Fecha/Hora', 'FR', 'FC', 'PAS', 'PAD', 'SAT O2', 'Temp °C', 'Peso', 'Talla']
                tabla_seccion = ExtractTables.econtrar_seccion(lst_documento, "Signos Vitales")
                tabla = []
                for i in tabla_seccion:
                    if (not(i.startswith('Fecha/Hora'))):
                        datos = []
                        fecha = ExtractTables.extract_fecha(i)
                        datos.append(fecha)
                        fecha = fecha + " "
                        tmp_string = i.replace(fecha, '')
                        lista_dividida = tmp_string.split('   ')
                        lista_dividida.pop()
                        datos.extend(lista_dividida)
                        tabla.append(datos)
                df = ExtractTables.comprobacion_final(tabla, columns)
                return df
            case "Órdenes de Dietéticas Activas":
                columns = ['Fecha Ingresada', 'Tipo', 'Tipo Terapéutico', 'Notas']
                tabla_seccion = ExtractTables.econtrar_seccion(lst_documento, "Órdenes de Dietéticas Activas")
                tabla = []
                for i in tabla_seccion:
                    if (not(i.startswith('Fecha'))):
                        datos = []
                        fecha = ExtractTables.extract_fecha(i)
                        datos.append(fecha)
                        fecha = fecha + " "
                        tmp_string = i.replace(fecha, '')
                        lista_dividida = tmp_string.split('   ')
                        lista_dividida.pop()
                        datos.extend(lista_dividida)
                        tabla.append(datos)

                df = ExtractTables.comprobacion_final(tabla, columns)
                return df
            case "Diagnósticos Activos":
                columns = ['Fecha Ingresada', 'Descripción', 'Tipo', 'Médico', 'Notas']
                tabla_seccion = ExtractTables.econtrar_seccion(lst_documento, "Diagnósticos Activos")
                tabla = []
                for i in tabla_seccion:
                    if (not(i.startswith('Fecha'))):
                        datos = []
                        fecha = ExtractTables.extract_fecha(i)
                        datos.append(fecha)
                        fecha = fecha + " "
                        tmp_string = i.replace(fecha, '')
                        lista_dividida = tmp_string.split('   ')
                        lista_dividida.pop()
                        datos.append(lista_dividida[0])
                        datos.append(lista_dividida[1])
                        datofinal = lista_dividida[-1]
                        lista_dividida.pop(0)
                        lista_dividida.pop(0)
                        lista_dividida.pop()
                        cadena = ""
                        for elemento in lista_dividida:
                            cadena = cadena + elemento
                        datos.append(cadena)
                        datos.append(datofinal)
                        tabla.append(datos)
                df = ExtractTables.comprobacion_final(tabla, columns)
                return df
            case "Órdenes de Enfermería Activas":
                columns = ['Fecha Ingresada', 'Orden', 'Médico']
                tabla_seccion = ExtractTables.econtrar_seccion(lst_documento, "Órdenes de Enfermería Activas")
                tabla = []
                for i in tabla_seccion:
                    if (not(i.startswith('Fecha'))):
                        datos = []
                        fecha = ExtractTables.extract_fecha(i)
                        datos.append(fecha)
                        fecha = fecha + " "
                        tmp_string = i.replace(fecha, '')
                        lista_dividida = tmp_string.split('   ')
                        lista_dividida.pop()
                        datos.append(lista_dividida[0])
                        lista_dividida.pop(0)
                        cadena = ""
                        for elemento in lista_dividida:
                            cadena = cadena + elemento      
                        datos.append(cadena)
                        tabla.append(datos)
                df = ExtractTables.comprobacion_final(tabla, columns)            
                return df
            case "Órdenes de Medicamentos Hospitalarios":
                columns = ["Inicio", "Medicamento", "Frecuencia", "Via", "Dosis", "UDM", "Cantidad", "Tipo", "Médico", "Tasa de Flujo"]
                tabla_seccion = ExtractTables.econtrar_seccion(lst_documento, "Órdenes de Medicamentos Hospitalarios")
                tabla = []
                for i in tabla_seccion:
                    if (not(i.startswith('Inicio'))):
                        datos = []
                        fecha = ExtractTables.extract_fecha(i)
                        datos.append(fecha)
                        fecha = fecha + " "
                        tmp_string = i.replace(fecha, '')
                        lista_dividida = tmp_string.split('   ')
                        lista_dividida.pop()
                        datofinal = lista_dividida[-1]
                        lista_dividida.pop()
                        for _ in range(7):
                            datos.append(lista_dividida[0])
                            lista_dividida.pop(0)
                        cadena = ""
                        for elemento in lista_dividida:
                            cadena = cadena + elemento
                        datos.append(cadena)
                        datos.append(datofinal)
                        tabla.append(datos)
                df = ExtractTables.comprobacion_final(tabla, columns)
                return df
            case _:
                df = pd.DataFrame()           
                return df