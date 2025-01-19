import chokidar from "chokidar";
import path from "path";
import pdfParse from "pdf-parse";
import fs from "fs";
import { Database } from "sqlite3";

const UPLOADS_FOLDER = path.resolve(__dirname, "../database/uploads");
console.log(`[DEBUG] Ruta absoluta de la carpeta 'uploads': ${UPLOADS_FOLDER}`);

const db = new Database(path.join(__dirname, "../database/notaria15tsx.db"));

// Validar que la carpeta de uploads exista antes de monitorear
if (!fs.existsSync(UPLOADS_FOLDER)) {
  console.error(`[ERROR] La carpeta ${UPLOADS_FOLDER} no existe. Verifica la ruta.`);
  process.exit(1);
}

// Función para procesar PDFs
const processPDF = async (fileName: string) => {
  const filePath = path.join(UPLOADS_FOLDER, fileName);

  try {
    console.log(`[INFO] Procesando archivo: ${fileName}`);
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    const radicadoMatch = pdfData.text.match(/RADICADO N°\s*(\d+)/i);
    if (!radicadoMatch) {
      console.warn(`[WARNING] No se encontró un radicado en el archivo ${fileName}`);
      return;
    }

    const radicado = radicadoMatch[1].trim();
    console.log(`[INFO] Radicado extraído: ${radicado}`);

    

    db.run(
      `UPDATE uploads
       SET identification_status = 'true', upload_date = datetime('now')
       WHERE radicado = ?`,
      [radicado],
      function (err) {
        if (err) {
          console.error(`[ERROR] No se pudo actualizar el radicado ${radicado}:`, err.message);
        } else if (this.changes === 0) {
          console.warn(`[WARNING] El radicado ${radicado} no existe en la tabla 'uploads'.`);
        } else {
          console.log(`[SUCCESS] Radicado ${radicado} actualizado a estado 'true'.`);
        }
      }
    );
  } catch (err) {
    if (err instanceof Error) {
      console.error(`[ERROR] Error al procesar el archivo ${fileName}:`, err.message);
    } else {
      console.error(`[ERROR] Error al procesar el archivo ${fileName}:`, err);
    }
  }
};

// Configuración del watcher con logs
const watcher = chokidar.watch(UPLOADS_FOLDER, {
  persistent: true,
  ignoreInitial: false, // Procesar archivos ya existentes al iniciar
  depth: 0, // No monitorear subcarpetas
  awaitWriteFinish: {
    stabilityThreshold: 2000, // Espera 2 segundos después de un cambio
    pollInterval: 100,
  },
});

watcher
  .on("add", (filePath) => {
    console.log(`[INFO] Archivo agregado: ${path.basename(filePath)}`);
    if (filePath.endsWith(".pdf")) processPDF(path.basename(filePath));
  })
  .on("change", (filePath) => {
    console.log(`[INFO] Archivo modificado: ${path.basename(filePath)}`);
  })
  .on("unlink", (filePath) => {
    console.warn(`[WARNING] Archivo eliminado: ${path.basename(filePath)}`);
  })
  .on("error", (error) => {
    if (error instanceof Error) {
      console.error(`[ERROR] Error en el watcher:`, error.message);
    } else {
      console.error(`[ERROR] Error desconocido en el watcher:`, error);
    }
  });

console.log(`[INFO] Monitoreando la carpeta ${UPLOADS_FOLDER} con Chokidar...`);
