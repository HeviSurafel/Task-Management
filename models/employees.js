const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    employee_id: { type: String, required: true, unique: true },
    phone: { type: Number, required: true },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        unique: true 
    },
     department:{
        type:String,
        enum:['Developer','Graphics Design','Marketing','Promotion','Video Editing'],
        required:true
      },
    dateOfBirth: { type: Date, required: true },
    startDate: { type: Date, required: true },
    gender: { type: String, required: true, enum: ['Male', 'Female'] },
});

module.exports = mongoose.model('Employee', employeeSchema);
