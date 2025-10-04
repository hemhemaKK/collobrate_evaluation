const Board = require("../models/Board");
const Column = require("../models/Column");

// Create a new board
const createBoard = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description)
      return res.status(400).json({ message: "Please fill the board name and description" });

    const board = await Board.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    // Populate createdBy before sending response
    await board.populate("createdBy", "name email");

    res.status(201).json(board);
  } catch (error) {
    console.error("Error creating board:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get all boards where user is a member
const getBoard = async (req, res) => {
  try {
    const boards = await Board.find({ members: req.user._id })
      .populate("createdBy", "name email") // populate creator info
      .sort({ createdAt: -1 }); // optional: show latest boards first
    res.json(boards);
  } catch (error) {
    console.error("Error fetching boards:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Delete a board (only by creator)
const deleteBard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: "Board not found" });

    if (board.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the board creator can delete this board" });
    }

    // Delete all columns related to this board
    await Column.deleteMany({ board: board._id });
    await board.deleteOne();

    res.json({ message: "Board and its columns deleted successfully" });
  } catch (error) {
    console.error("Error deleting board:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Add a column to a board
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
    console.error("Error adding column:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get all columns for a board
const getColumn = async (req, res) => {
  try {
    const columns = await Column.find({ board: req.params.boardId }).sort("position");
    res.json(columns);
  } catch (error) {
    console.error("Error fetching columns:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBoard, getBoard, getColumn, addColumn, deleteBard };
