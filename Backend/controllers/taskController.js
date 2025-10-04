const Task = require("../models/Task")
const Column = require("../models/Column")
const Board = require("../models/Board")

exports.createTask = async (req, res) => {
    try {
        const { title, description, columnId, position, dueDate } = req.body;

        if (!title || !columnId) {
            return res.status(400).json({ message: "Title and columnId are required" });
        }

        const column = await Column.findById(columnId);
        if (!column) return res.status(404).json({ message: "Column not found" });
        const board = await Board.findById(column.board);
        if (!board.members.includes(req.user._id)) {
            return res.status(403).json({ message: "You are not a member of this board" });
        }

        const task = await Task.create({
            title,
            description,
            column: columnId,
            board: column.board,
            position,
            dueDate,
        });

        const io = req.app.get("io");
        io.emit("taskUpdated", { action: "create", task });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const updates = req.body;

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        // Check membership
        const board = await Board.findById(task.board);
        if (!board.members.includes(req.user._id)) {
            return res.status(403).json({ message: "You are not allowed to update this task" });
        }

        Object.assign(task, updates);
        await task.save();

        const io = req.app.get("io");
        io.emit("taskUpdated", { action: "create", task });

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "task not found" });

        const board = await Board.findById(task.board);
        if (!board.members.includes(req.user._id)) {
            return res.status(403).json({ message: "You are not allowed to delete this task" });
        }

        await task.deleteOne();

        const io = req.app.get("io");
        io.emit("taskUpdated", { action: "create", task });

        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get tasks of a column (for displaying / drag-and-drop)
exports.getTasksByColumn = async (req, res) => {
    try {
        const { columnId } = req.params;

        const tasks = await Task.find({ column: columnId }).sort("position");
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTasksByBoard = async ( req, res)=>{
   try {
      const {boardId} = req.params;
      const {title, assinedTo, dueTo} = req.body;

      const board = await Board.findById(boardId);
      if(!board) return res.status(404).json({message:"Board not found"})
    
      if(!board.members.includes(req.user._id))
        return res.status(403).json({message:"you are not a member of this board"})

      let query = {booard: boardId};
      if(title){
        query.title = {$regex: title, $options: "i"}
      }

      if(assignedTo){
        query.assignedTo = assinedTo;
      }

      if(dueFrom || dueTo){
        query.dueDate = {};
      if (dueFrom) query.dueDate.$gte = new Date(dueFrom);
      if (dueTo) query.dueDate.$lte = new Date(dueTo);
    }

    const tasks = await Task.find(query).sort("position");
    res.json(tasks)
   } catch (error) {
    res.status(500).json({ message: error.message });
   }
}