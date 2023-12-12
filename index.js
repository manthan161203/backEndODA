const express = require('express')
const { PORT, connectDB } = require('./config/database')
const app = express()

// Connect to MongoDB
connectDB()

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
