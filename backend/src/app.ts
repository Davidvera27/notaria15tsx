import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import caseRentsRoutes from './routes/caseRentsRoutes';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api', caseRentsRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
