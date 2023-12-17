const express = require('express');
const { PORT, connectDB } = require('./config/database');
const cors = require('cors');
const loginRouter = require('./routers/loginRouter');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Connect to MongoDB
connectDB();

// Routes
app.use('/login', loginRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
