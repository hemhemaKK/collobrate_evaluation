const mongoose = require("mongoose")
const connectDb = async () => {
    try {
        const conn = await mongoose.connect("mongodb://127.0.0.1:27017/collabrate_db")
        console.log("mongo db connected successfully")
    } catch (error) {
        console.error(`error: ${error.message}`)
        process.exit(1)
    }
};

module.exports = connectDb;