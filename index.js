const express = require('express');
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
const superAdminRouter = require('./routers/superAdminRouter');
const unifiedDoctorRouter = require('./routers/unifiedDoctorRouter');
const patientRouter = require('./routers/patientRouter');
const userRouter = require('./routers/userRouter');

connectDB();

const app = express();
const bodyParser = require('body-parser')
// Middleware

const cors = require('cors');
const UnifiedDoctor = require('./models/unifiedDoctorSchema');
app.set('view engine', 'pug');
app.use(express.json());
app.use(fileUpload());
app.use(express.static('public'));

// app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
// Connect
// Routes
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/admin', adminRouter);
app.use('/superAdmin', superAdminRouter);
app.use('/doctor', unifiedDoctorRouter);
app.use('/patient', patientRouter);
app.use('/user', userRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
