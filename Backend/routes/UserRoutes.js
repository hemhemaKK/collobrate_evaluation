const express = require("express")
const { getUsers, registeredUser, loginUser } = require("../controllers/UserControllers");
const { protect, authorize } = require("../middleware/authMiddleware");


const router = express.Router()

router.get('/profile',protect,getUsers);
router.post('/register',registeredUser);
router.post('/login', loginUser);

router.get('mentor-area', protect, authorize("mentor","admin"), (req, res)=>{
    res.json({message:`welcome, ${req.user.role}`})
})

module.exports = router;