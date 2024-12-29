import { Request, Response } from "express";
import * as case_rents_model from "../models/case_rents_model";
import { Caserents } from '../interface/Caserents';

// Controlador para validar si un radicado ya existe
export const validarRadicadoExistente = async (req: Request, res: Response): Promise<void> => {
    const { radicado } = req.body; // Obtiene el radicado del cuerpo de la solicitud
  
    try {
      const result = await case_rents_model.ValidarRadicadoExistente(radicado); // Llama al servicio para validar el radicado
      if (result) {
        res.status(400).json({ error: `El radicado ya existe en la base de datos.` });
      } else {
        res.status(200).json({ message: 'El radicado no existe.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al verificar el radicado.' });
    }
  };
  
  // Controlador para validar si una escritura y fecha de documento ya existen
export const validarEscrituraExistente = async (req: Request, res: Response): Promise<void> => {
    const { escritura, document_date } = req.body; // Obtiene escritura y fecha de documento del cuerpo de la solicitud
  
    try {
      const result = await case_rents_model.ValidarEscrituraExistente(escritura, document_date); // Llama al servicio para validar la escritura
      if (result) {
        res.status(400).json({ error: 'La combinación de escritura y fecha del documento ya existe.' });
      } else {
        res.status(200).json({ message: 'La escritura y fecha del documento no existen.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al verificar la escritura y fecha del documento.' });
    }
  };
  
  // Controlador para insertar un nuevo caso de renta
export const insertarCasoRentas = async (req: Request, res: Response): Promise<void> => {
    const { creation_date, document_date, escritura, radicado, protocolista, observaciones }: Caserents = req.body;
    const last_modified = new Date().toISOString(); // Genera la fecha actual para el campo "last_modified"
  
    try {
      // Llamada al servicio de inserción
      const result = await case_rents_model.insertarCasoRentas({
        creation_date,
        document_date,
        escritura,
        radicado,
        protocolista,
        observaciones,
        last_modified,
      });
  
      res.status(201).json({ id: result, message: 'Caso de renta insertado correctamente.' });
    } catch (error) {
      res.status(500).json({ error: 'Error al insertar el caso de renta.' });
    }
  };
  
  // Controlador para obtener todos los casos de renta
export const obtenerTodoCasosRentas = async (_req: Request, res: Response): Promise<void> => {
    try {
      const casosRentas = await case_rents_model.ObtenerTodoCasosRentas(); // Llama al servicio para obtener todos los casos
      res.json(casosRentas);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los casos de rentas.' });
    }
  };
  
  // Controlador para actualizar un caso de renta existente
export const actualizarCasoRentas = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // Obtiene el ID del parámetro de la URL
    const { creation_date, document_date, escritura, radicado, protocolista, observaciones }: Caserents = req.body;
    const last_modified = new Date().toISOString(); // Genera la fecha actual para el campo "last_modified"
  
    try {
      // Llamada al servicio para actualizar el caso
      const result = await case_rents_model.ActualizarCasoRentas(Number(id), {
            creation_date,
            document_date,
            escritura,
            radicado,
            protocolista,
            observaciones,
            last_modified,
        });

      if (result === 0) {
        res.status(404).json({ error: 'No se encontró el caso de renta para actualizar.' });
      } else {
        res.status(200).json({ message: 'Caso de renta actualizado correctamente.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el caso de renta.' });
    }
  };
  
  // Controlador para eliminar un caso de renta
export const eliminarCasoRentas = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // Obtiene el ID del parámetro de la URL
  
    try {
      // Llamada al servicio para eliminar el caso
      const result = await case_rents_model.deleteCaseRent(Number(id));
  
      if (result === 0) {
        res.status(404).json({ error: 'No se encontró el caso de renta para eliminar.' });
      } else {
        res.status(200).json({ message: 'Caso de renta eliminado correctamente.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el caso de renta.' });
    }
  };
