const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const app = express();

const { PORT, connectDB } = require('./config/database');

const loginRouter = require('./routers/loginRouter');
const registerRouter = require('./routers/registerRouter');

app.use(express.json());
app.use(express.urlencoded())
app.use(cors());
app.use(fileUpload());

// Connect to MongoDB
connectDB();

// Routes
app.use('/login', loginRouter);
app.use('/register', registerRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
