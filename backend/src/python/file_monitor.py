import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import requests

# Ruta absoluta de la carpeta "uploads"
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
PROCESS_ENDPOINT = "http://127.0.0.1:5001/process-pdf"

# Validar que la carpeta "uploads" exista
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    print(f"Carpeta asegurada en: {UPLOAD_FOLDER}")

class FileHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith(".pdf"):
            print(f"Nuevo archivo detectado: {event.src_path}")
            try:
                response = requests.post(PROCESS_ENDPOINT, json={"file_path": event.src_path})
                if response.status_code == 200:
                    print(f"Archivo procesado exitosamente: {os.path.basename(event.src_path)}")
                else:
                    print(f"Error al procesar el archivo {os.path.basename(event.src_path)}: {response.text}")
            except Exception as e:
                print(f"Error al intentar procesar el archivo {event.src_path}: {e}")

if __name__ == "__main__":
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
