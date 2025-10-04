const Board = require("../models/Board");
const Column = require("../models/Column");


const createBoard = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description)
      return res.status(400).json({ message: "Please fill the board name and description" });

    const board = await Board.create({
      name,
      description,
      createdBy: req.user._id, // make sure this is correct
      members: [req.user._id],
    });

    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getBoard = async (req, res) => {
    try {
        const board = await Board.find({ members: req.user._id }).populate("createdBy", "name email");
        res.json(board)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const deleteBard = async (req, res) => {
    try {
        const board = await Board.findById(req.params.id);
        if (!board) return res.status(404).json({ message: "Board not found" });

        if (board.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the board creator can delete this board" });
        }

        await Column.deleteMany({ board: board._id });
        await board.deleteOne();

        res.json({ message: "Board and its columns deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "server Error" })
    }
}

const addColumn = async (req, res) => {
    try {
        const { title, position } = req.body;
        const { boardId } = req.params;
        const board = await Board.findById(boardId);
        if (!board) return res.status(404).json({ message: "Board not found" });

        if (!board.members.includes(req.user._id)) {
            return res.status(403).json({ message: "You are not a member of this board" });
        }

        const column = await Column.create({ title, position, board: boardId });
        res.status(201).json(column);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

const getColumn = async (req, res) => {
    try {
        const columns = await Column.find({ board: req.params.boardId }).sort("position");
        res.json(columns)
    } catch (error) {
        res.status(500).json({ message: "error in geting column" })
    }
}


module.exports = { createBoard, getBoard, getColumn, addColumn, deleteBard }