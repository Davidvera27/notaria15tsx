import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import caseRentsRoutes from './routes/caseRentsRoutes';
import protocolistRentsRoutes from './routes/protocolistRentsRoutes';
import emailRoutes from './routes/emailRoutes';
import caseRentsFinishedRoutes from "./routes/caseRentsFinishedRoutes";


const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', caseRentsRoutes);
app.use('/api', protocolistRentsRoutes);
app.use('/api', emailRoutes);
app.use("/api", caseRentsFinishedRoutes);

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
