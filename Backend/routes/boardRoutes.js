const express = require("express")
const { protect } = require("../middleware/authMiddleware");
const { getBoard, createBoard, deleteBard, addColumn, getColumn } = require("../controllers/BoardControllers");


const router = express.Router()

router.get('/',protect,getBoard);
router.post('/',protect,createBoard);
router.delete('/:id', protect,deleteBard);

router.post('/:boardId/columns',protect,addColumn);
router.get('/:boardId/columns', protect,getColumn);



module.exports = router;