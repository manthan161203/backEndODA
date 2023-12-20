const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { PORT, connectDB } = require('./config/database'); // Assuming the connectDB function is defined in the database configuration file

const loginRouter = require('./routers/loginRouter');
const registerRouter = require('./routers/registerRouter');
const adminRouter = require('./routers/adminRouter'); // Import your adminRouter

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.use(cors());
app.use(fileUpload());

// Connect to MongoDB
connectDB(); // Assuming the connectDB function is defined in the database configuration file

// Routes
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/admin', adminRouter); // Mount the adminRouter at '/admin' path

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
