import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import caseRentsRoutes from './routes/caseRentsRoutes';
import protocolistRentsRoutes from './routes/protocolistRentsRoutes';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api', caseRentsRoutes);
app.use('/api', protocolistRentsRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
