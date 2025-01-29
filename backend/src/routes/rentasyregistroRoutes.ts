import { Router, Request, Response } from "express";
import db from "../database/db";  // Asegúrate de tener la conexión a la base de datos

const router = Router();

// Definir la interfaz para los resultados de la consulta
interface FacturaTotales {
  escritura: number;
  total_valor_factura: number;
  total_facturas: number;
  total_valor_rentas: number;
  total_valor_registro: number;
  total_valor_factura_sin_cancelar: number;
  total_valor_factura_cancelado: number;
}

// Ruta para obtener los totales por escritura
router.get("/facturas_totales", (req: Request, res: Response) => {
  const consultaTotales = `
    SELECT
      escritura,
      SUM(valor_rentas + valor_registro) AS total_valor_factura,
      COUNT(*) AS total_facturas,
      SUM(valor_rentas) AS total_valor_rentas,
      SUM(valor_registro) AS total_valor_registro,
      SUM(CASE WHEN estado = 'sin cancelar' THEN valor_rentas + valor_registro ELSE 0 END) AS total_valor_factura_sin_cancelar,
      SUM(CASE WHEN estado = 'cancelado' THEN valor_rentas + valor_registro ELSE 0 END) AS total_valor_factura_cancelado
    FROM
      facturas
    GROUP BY
      escritura;
  `;

  // Ejecutar la consulta
  db.all(consultaTotales, [], (err, filas: FacturaTotales[]) => {  // Especificar el tipo de 'filas'
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Mapeamos las filas, aunque en este caso no es estrictamente necesario si ya están tipadas correctamente
    res.status(200).json(filas); // Las filas ya tienen el tipo FacturaTotales
  });
});

export default router;
