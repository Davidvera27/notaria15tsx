const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const caseRentsRoutes = require('./routes/caseRentsRoutes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api', caseRentsRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
