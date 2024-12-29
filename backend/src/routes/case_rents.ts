import { Router } from 'express';
import * as caseRentsController from '../controllers/case_rents_controller';

const router = Router();

// Ruta para obtener todos los casos de rentas
router.get('/', caseRentsController.obtenerTodoCasosRentas);

// Ruta para crear un nuevo caso de rentas
router.post('/', caseRentsController.insertarCasoRentas);

// Ruta para actualizar un caso de rentas por su ID
router.put('/:id', caseRentsController.actualizarCasoRentas);

// Ruta para eliminar un caso de rentas por su ID
router.delete('/:id', caseRentsController.eliminarCasoRentas);

export{router};
