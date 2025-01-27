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

app = Flask(__name__)

@app.route("/process-pdf", methods=["POST"])
def process_pdf():
    file_path = request.json.get("file_path")

    if not file_path or not file_path.endswith(".pdf"):
        return jsonify({"error": "Ruta de archivo no válida o archivo no es PDF"}), 400

    if not os.path.exists(file_path):
        return jsonify({"error": "Archivo no encontrado"}), 404

    try:
        with fitz.open(file_path) as pdf:
            print(f"Procesando el archivo: {file_path}")
            extracted_data = extract_data_from_pdf(pdf)
            print(f"Datos extraídos: {extracted_data}")
            return jsonify({"data": extracted_data}), 200
    except Exception as e:
        print(f"Error procesando el archivo {file_path}: {e}")
        return jsonify({"error": str(e)}), 500


def extract_data_from_pdf(pdf):
    text = ""
    for page in pdf:
        try:
            text += page.get_text("text")
        except Exception as e:
            print(f"Error leyendo una página del PDF: {e}")
            continue

    if not text.strip():
        raise ValueError("No se pudo extraer texto del PDF")

    return {
        "RADICADO": extract_value(text, "RADICADO N°"),
        "N_DOC": extract_value(text, "N° DOC"),
        "FECHA_LIMITE": extract_value(text, "FECHA LÍMITE DE REGISTRO"),
        "TOTAL_PAGAR": extract_value(text, "TOTAL A PAGAR"),
        "LUGAR_EXPEDICION": extract_value(text, "LUGAR DE EXPEDICIÓN"),
        "FECHA_LIQ": extract_value(text, "FECHA LIQ"),
        "OTORGADA_POR": extract_value(text, "OTORGADA POR"),
        "A_FAVOR_DE": extract_value(text, "A FAVOR DE"),
        "ORIGEN_DOC": extract_value(text, "ORIGEN DOC"),
        "CLASE": extract_value(text, "CLASE"),
        "MATR_INM": extract_value(text, "MATR. INM"),
        "VALOR_LETRAS": extract_value(text, "VALOR EN LETRAS"),
        "NOMBRE_LIQUIDADOR": extract_value(text, "NOMBRE LIQUIDADOR"),
    }


def extract_value(text, label):
    # Busca el valor asociado al label usando expresiones regulares
    pattern = rf"{label}[:\s]*(.*?)(?:\s{2,}|\n)"
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group(1).strip() if match else "No encontrado"


if __name__ == "__main__":
    app.run(port=5001)
