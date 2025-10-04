const User = require('../models/User');

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const createUser = async (req, res)=>{
    try {
        const {name, email, password} = req.body;
        const users = new User({name, email, password});
        const savedUser = await users.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

module.exports = {getUsers, createUser}