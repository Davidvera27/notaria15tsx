import { Router, Request, Response } from "express";
import db from "../database/db";

const router = Router();

interface Facturas {
  factura_numero: number;
  valor_rentas: number;
  valor_registro: number;
  metodo_pago: "pse" | "efectivo";
  estado: "cancelado" | "sin cancelar";
  fecha: string;
  escritura: number; // Añadimos 'escritura' en la interfaz
}


// Función de ayuda para validar los datos de la factura
const validarDatosFactura = (factura: Facturas, res: Response) => {
  const { factura_numero, valor_rentas, valor_registro, metodo_pago, estado, fecha, escritura } = factura;

  // Validación de 'escritura' (asegurarse de que no sea nula ni inválida)
  if (!Number.isInteger(escritura) || escritura <= 0) {
    return res.status(400).json({ error: "El campo 'escritura' debe ser un número entero positivo." });
  }

  // Validación de 'factura_numero'
  if (!Number.isInteger(factura_numero) || factura_numero <= 0) {
    return res.status(400).json({ error: "El número de factura debe ser un número entero positivo." });
  }

  // Validación de 'valor_rentas'
  if (typeof valor_rentas !== "number" || valor_rentas < 0) {
    return res.status(400).json({ error: "El valor de rentas debe ser un número no negativo." });
  }

  // Validación de 'valor_registro'
  if (typeof valor_registro !== "number" || valor_registro < 0) {
    return res.status(400).json({ error: "El valor del registro debe ser un número no negativo." });
  }

  // Validación de 'metodo_pago'
  if (metodo_pago !== "pse" && metodo_pago !== "efectivo") {
    return res.status(400).json({ error: "El método de pago debe ser 'pse' o 'efectivo'." });
  }

  // Validación de 'estado'
  if (estado !== "cancelado" && estado !== "sin cancelar") {
    return res.status(400).json({ error: "El estado debe ser 'cancelado' o 'sin cancelar'." });
  }

  // Validación de 'fecha'
  if (!fecha || isNaN(Date.parse(fecha))) {
    return res.status(400).json({ error: "La fecha es obligatoria y debe tener un formato válido (YYYY-MM-DD)." });
  }

  return null; // No hay errores de validación
};

// ==================== CRUD PARA FACTURAS ====================

// Crear una nueva factura
router.post("/facturas", (req: Request, res: Response) => {
  const factura: Facturas = req.body;

  const errorValidacion = validarDatosFactura(factura, res);
  if (errorValidacion) return errorValidacion;

  const consultaInsertarFactura = `
    INSERT INTO facturas (factura, valor_rentas, valor_registro, metodo_pago, estado, fecha, escritura)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    consultaInsertarFactura,
    [
      factura.factura_numero,   // Aquí se incluye el número de factura
      factura.valor_rentas,
      factura.valor_registro,
      factura.metodo_pago,
      factura.estado,
      factura.fecha,
      factura.escritura,        // Aquí se pasa el valor de 'escritura'
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Obtener todas las facturas
router.get("/facturas", (req: Request, res: Response) => {
  const consultaSeleccionar = `SELECT * FROM facturas`;

  db.all(consultaSeleccionar, [], (err, filas) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(filas);
  });
});

// Obtener una factura por ID
router.get("/facturas/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  const consultaSeleccionar = `SELECT * FROM facturas WHERE id = ?`;
  db.get(consultaSeleccionar, [id], (err, fila) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!fila) {
      return res.status(404).json({ error: "Factura no encontrada." });
    }
    res.status(200).json(fila);
  });
});

// Actualizar una factura por ID
router.put("/facturas/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const factura: Facturas = req.body;

  const errorValidacion = validarDatosFactura(factura, res);
  if (errorValidacion) return errorValidacion;

  const consultaActualizar = `
    UPDATE facturas
    SET factura = ?, valor_rentas = ?, valor_registro = ?, metodo_pago = ?, estado = ?, fecha = ?, escritura = ?
    WHERE id = ?
  `;

  db.run(
    consultaActualizar,
    [
      factura.factura_numero,   // Aquí se incluye el número de factura
      factura.valor_rentas,
      factura.valor_registro,
      factura.metodo_pago,
      factura.estado,
      factura.fecha,
      factura.escritura,        // Aquí se pasa el valor de 'escritura'
      id,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Factura no encontrada." });
      }
      res.status(200).json({ message: "Factura actualizada correctamente." });
    }
  );
});

// Eliminar una factura por ID
router.delete("/facturas/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  const consultaEliminar = `DELETE FROM facturas WHERE id = ?`;

  db.run(consultaEliminar, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Factura no encontrada." });
    }
    res.status(200).json({ message: "Factura eliminada correctamente." });
  });
});

export default router;
