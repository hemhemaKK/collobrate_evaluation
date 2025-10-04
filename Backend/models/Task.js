const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  board: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
  column: { type: mongoose.Schema.Types.ObjectId, ref: "Column"},
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  position: { type: Number, default: 0 },
  dueDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
