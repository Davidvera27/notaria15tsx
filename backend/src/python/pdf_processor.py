from flask import Flask, request, jsonify
import fitz  # PyMuPDF para leer PDFs
import os

app = Flask(__name__)

@app.route("/process-pdf", methods=["POST"])
def process_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No se envió un archivo PDF"}), 400

    file = request.files["file"]
    pdf_path = f"./backend/uploads/{file.filename}"
    file.save(pdf_path)

    try:
        with fitz.open(pdf_path) as pdf:
            print(f"Procesando el archivo: {pdf_path}")
            extracted_data = extract_data_from_pdf(pdf)
            print(f"Datos extraídos: {extracted_data}")
            return jsonify({"data": extracted_data}), 200
    except Exception as e:
        print(f"Error procesando el archivo {pdf_path}: {e}")
        return jsonify({"error": str(e)}), 500

    if "file" not in request.files:
        return jsonify({"error": "No se envió un archivo PDF"}), 400

    file = request.files["file"]
    pdf_path = f"./backend/uploads/{file.filename}"
    file.save(pdf_path)

    try:
        with fitz.open(pdf_path) as pdf:
            extracted_data = extract_data_from_pdf(pdf)
            return jsonify({"data": extracted_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def extract_data_from_pdf(pdf):
    text = ""
    for page in pdf:
        try:
            text += page.get_text("text")  # Intenta obtener texto en formato plano
        except Exception as e:
            print(f"Error leyendo una página del PDF: {e}")
            continue

    if not text.strip():
        raise ValueError("No se pudo extraer texto del PDF")

    # Extraer campos con patrones definidos
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
    # Busca después de la etiqueta y antes del salto de línea
    pattern = rf"{label}[:\s]*(.*?)(?:\s{2,}|\n)"
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group(1).strip() if match else "No encontrado"
    start += len(label)
    end = text.find("\n", start)
    return text[start:end].strip()

if __name__ == "__main__":
    app.run(port=5001)
