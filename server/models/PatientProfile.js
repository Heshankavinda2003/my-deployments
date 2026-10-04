const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientId: { type: String, required: true, unique: true }, 
    fullName: { type: String, required: true },
    bloodGroup: { type: String },
    dob: { type: Date },
    phone: { type: String },
    address: { type: String },
    gender: { type: String },
    qrCodeData: { type: String },
    
    medicalHistory: {
        diagnoses: [{
            diagnosis: { type: String }, 
            doctor: { type: String },    
            date: { type: Date }         
            
        }],
        surgeries: [{
            procedure: { type: String }, 
            year: { type: String }       
        }],
        allergies: [{ 
            type: String                 
        }],
        vaccinations: [{
            name: { type: String },      
            year: { type: String }       
        }]
    },
    emergencyContact: {
        name: { type: String },
        relation: { type: String },
        phone: { type: String }
    }
}, { timestamps: true });

module.exports = mongoose.model('PatientProfile', patientProfileSchema);