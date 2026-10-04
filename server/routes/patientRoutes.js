const express = require('express');
const router = express.Router();

const { getDashboard ,createTestProfile ,downloadQRCode ,getMedicalHistory ,getPrescriptions} = require('../controllers/patientController');
const { protect, patientOnly } = require('../middleware/authMiddleware');

router.post('/test-profile', protect, patientOnly, createTestProfile);
router.get('/dashboard', protect, patientOnly, getDashboard);
router.get('/download-qr', protect, patientOnly, downloadQRCode);
router.get('/medical-history', protect, patientOnly, getMedicalHistory);
router.get('/prescriptions', protect, patientOnly, getPrescriptions);   
module.exports = router;