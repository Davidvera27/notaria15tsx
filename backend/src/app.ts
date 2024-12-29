import express, {Express, Request,Response} from "express"
import { router } from './routes/index';
import cors from 'cors';

const PORT = 3030; // en mac el puerto 5000 esta en uso 
const app: Express = express();
app.use(cors());//Consumido por cualquier origen

app.use(express.json());
app.use(router);


app.listen(PORT, () => {
	console.log(`server listening on port: http://localhost:${PORT}`);
});

