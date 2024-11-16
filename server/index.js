const express = require('express');
const app = express();
const  mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db')
dotenv.config();
connectDB();
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
const userRoute = require('./routers/users');
const authRoute = require('./routers/auth');
const postRoute = require('./routers/posts')

app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Backend server is running on port ${PORT}.`)
})