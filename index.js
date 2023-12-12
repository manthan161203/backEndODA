const express = require('express')
const { PORT, connectDB } = require('./config/database')
const cors = require('cors');
const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Connect to MongoDB
connectDB()

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
