const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'PatientProfile', required: true },
    prescriptionId: { type: String, required: true }, 
    doctorName: { type: String },     
    hospital: { type: String },       
    diagnosis: { type: String },      
    dateIssued: { type: Date, default: Date.now },
    medications: [{
        name: { type: String },       
        dosage: { type: String },    
        frequency: { type: String },  
        duration: { type: String }    
    }]
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);