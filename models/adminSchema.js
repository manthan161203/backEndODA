const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    assignedDepartments: [{
        type: String
    }],
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;