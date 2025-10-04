const express = require("express")

const { protect } = require("../middleware/authMiddleware");
const { createTask, updateTask, deleteTask, getTasksByColumn, getTasksByBoard } = require("../controllers/taskController");


const router = express.Router()

router.post('/',protect,createTask);
router.put('/:taskId', protect,updateTask);

router.delete('/:taskId',protect,deleteTask);
router.get('/:taskId/:columnId', protect,getTasksByColumn);
router.get('/board/:boardId', protect, getTasksByBoard)


module.exports = router;