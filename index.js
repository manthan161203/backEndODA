const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { PORT, connectDB } = require('./config/database');

const User = require('./models/userSchema');
const Patient = require('./models/patientSchema');
const Appointment = require('./models/appointmentSchema');
const Doctor = require('./models/unifiedDoctorSchema');
const SuperAdmin = require('./models/superAdminSchema');
const Admin = require('./models/adminSchema');
const Hospital = require('./models/hospitalSchema');

const loginRouter = require('./routers/loginRouter');
const registerRouter = require('./routers/registerRouter');
const adminRouter = require('./routers/adminRouter');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.use(cors());
// app.use(fileUpload());

// Connect to MongoDB
connectDB();

// Routes
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/admin', adminRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
