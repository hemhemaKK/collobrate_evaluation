const express = require("express");
const app = express();
const PORT = 3000;
const cors = require("cors");
const dotenv = require('dotenv');
const connectDb = require('./config/db');


dotenv.config()
connectDb();

app.use(cors())
app.use(express.json())

app.get('/',(req, res)=>{
    res.send('server running...')
    console.log("server started")
})

app.listen(PORT,()=>{
    console.log(`server running in http://localhost:${PORT}`)
})