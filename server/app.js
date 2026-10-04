const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');

const app = express();

app.use(cors()); 
app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);

app.get('/', (req, res) => {
    res.send('Medicare Hospital API is running...');
});

module.exports = app;