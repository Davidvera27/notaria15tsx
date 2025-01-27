import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import requests

# Ruta de la carpeta "uploads"
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
PROCESS_ENDPOINT = "http://127.0.0.1:5001/process-pdf"

# Lista para controlar archivos procesados
processed_files = set()

class FileHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith(".pdf"):
            if event.src_path not in processed_files:
                time.sleep(1)  # Espera para asegurar que el archivo esté completamente escrito
                print(f"Nuevo archivo detectado: {event.src_path}")
                try:
                    response = requests.post(
                        PROCESS_ENDPOINT,
                        json={"file_path": event.src_path},  # Enviar la ruta del archivo como JSON
                        headers={"Content-Type": "application/json"}
                    )
                    if response.status_code == 200:
                        print(f"Archivo procesado exitosamente: {os.path.basename(event.src_path)}")
                        processed_files.add(event.src_path)
                    else:
                        print(f"Error procesando archivo: {response.text}")
                except Exception as e:
                    print(f"Error procesando archivo {event.src_path}: {e}")

if __name__ == "__main__":
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    event_handler = FileHandler()
    observer = Observer()
    observer.schedule(event_handler, UPLOAD_FOLDER, recursive=False)
    print(f"Monitor de archivos iniciado en: {UPLOAD_FOLDER}")
    observer.start()
    try:
        while True:
            time.sleep(10)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
