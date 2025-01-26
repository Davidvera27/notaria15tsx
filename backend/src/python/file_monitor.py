import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import requests

UPLOAD_FOLDER = os.path.abspath("./backend/uploads")
PROCESS_ENDPOINT = "http://127.0.0.1:5001/process-pdf"

# Asegurar que la carpeta exista
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    print(f"Carpeta creada: {UPLOAD_FOLDER}")

class FileHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith(".pdf"):
            print(f"Nuevo archivo detectado: {event.src_path}")
            try:
                with open(event.src_path, "rb") as file:
                    response = requests.post(PROCESS_ENDPOINT, files={"file": file})
                    print(f"Respuesta del servidor: {response.json()}")
            except Exception as e:
                print(f"Error procesando {event.src_path}: {e}")

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
