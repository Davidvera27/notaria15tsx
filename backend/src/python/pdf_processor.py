from flask import Flask, request, jsonify
import fitz  # PyMuPDF para leer PDFs
import os
import re

# Ruta absoluta de la carpeta "uploads"
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))

# Validar que la carpeta "uploads" exista
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    print(f"Carpeta asegurada en: {UPLOAD_FOLDER}")

# Lista para controlar archivos procesados
processed_files = set()

app = Flask(__name__)

@app.route("/process-pdf", methods=["POST"])
def process_pdf():
    # Obtener la ruta del archivo enviada en la solicitud
    data = request.get_json()
    file_path = data.get("file_path")

    if not file_path or not file_path.endswith(".pdf"):
        return jsonify({"error": "Ruta de archivo no válida o archivo no es PDF"}), 400

    if not os.path.exists(file_path):
        return jsonify({"error": "Archivo no encontrado"}), 404

    # Verificar si el archivo ya fue procesado
    if file_path in processed_files:
        return jsonify({"message": "El archivo ya fue procesado"}), 200

    try:
        # Procesar y extraer los datos del PDF
        extracted_data = extract_pdf_data(file_path)
        processed_files.add(file_path)  # Agregar a la lista de archivos procesados
        print(f"Datos extraídos: {extracted_data}")
        return jsonify({"data": extracted_data}), 200
    except Exception as e:
        print(f"Error procesando el archivo {file_path}: {e}")
        return jsonify({"error": str(e)}), 500


def extract_field(text, field_name):
    """
    Extrae un campo del texto del PDF basado en el nombre del campo.
    """
    pattern = rf"{field_name}[:\s]*(.*?)(?:\s{2,}|\n|$)"
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group(1).strip() if match else "No encontrado"


def extract_fecha_limite(text):
    """
    Extrae específicamente la fecha límite del registro (formato: dd.mm.yyyy).
    """
    pattern = r"FECHA L[IÍ]MITE\s+DE\s+REGISTRO\s+(\d{2}\.\d{2}\.\d{4})"
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group(1).strip() if match else "No encontrado"


def extract_pdf_data(pdf_path):
    """
    Procesa un archivo PDF y extrae todos los campos requeridos.
    """
    with fitz.open(pdf_path) as pdf:
        text = ""
        for page in pdf:
            text += page.get_text()

    return {
        "RADICADO": extract_field(text, "RADICADO N°"),
        "N_DOC": extract_field(text, "N° DOC"),
        "FECHA_LIMITE": extract_fecha_limite(text),
        "TOTAL_PAGAR": extract_field(text, "TOTAL A PAGAR"),
        "LUGAR_EXPEDICION": extract_field(text, "LUGAR DE EXPEDICIÓN"),
        "FECHA_LIQ": extract_field(text, "FECHA LIQ"),
        "OTORGADA_POR": extract_field(text, "OTORGADA POR"),
        "A_FAVOR_DE": extract_field(text, "A FAVOR DE"),
        "ORIGEN_DOC": extract_field(text, "ORIGEN DOC"),
        "CLASE": extract_field(text, "CLASE"),
        "MATR_INM": extract_field(text, "MATR. INM"),
        "VALOR_LETRAS": extract_field(text, "VALOR EN LETRAS"),
        "NOMBRE_LIQUIDADOR": extract_field(text, "NOMBRE LIQUIDADOR"),
    }


if __name__ == "__main__":
    app.run(port=5001)
