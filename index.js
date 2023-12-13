const express = require('express')
const { PORT, connectDB } = require('./config/database')
const cors = require('cors');
const app = express()
const User = require('./models/userSchema');
const Patient = require('./models/patientSchema');
const Appointment = require('./models/appointmentSchema');
const Doctor = require('./models/unifiedDoctorSchema');
const SuperAdmin = require('./models/superAdminSchema');
const Admin = require('./models/adminSchema');
const Hospital = require('./models/hospitalSchema');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Connect to MongoDB
connectDB()

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
