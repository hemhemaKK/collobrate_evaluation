import React, { useEffect, useState } from "react";
import { getBoards, createBoard, getColumns, createColumn, getTasks, createTask } from "../services/api";
import Column from "../components/Column";
import io from "socket.io-client";

const socket = io("http://localhost:5000");


  const BoardPage = ({ onLogout, user }) => {
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [newBoard, setNewBoard] = useState({ name: "", description: "" });

  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState({ search: "", assignedTo: "", dueFrom: "", dueTo: "" });

  const [newColumn, setNewColumn] = useState({ title: "", position: 0 });
  const [newTask, setNewTask] = useState({ title: "", description: "", column: "" });

  // Fetch boards
  const fetchBoards = async () => {
    try {
      const res = await getBoards();
      setBoards(res.data);
      if (!selectedBoard && res.data.length > 0) setSelectedBoard(res.data[0]);
    } catch (err) {
      console.error("Error fetching boards:", err);
    }
  };

  // Fetch columns and tasks for selected board
  const fetchColumnsAndTasks = async (boardId) => {
    try {
      const resCols = await getColumns(boardId);
      setColumns(resCols.data || []);

      let query = [];
      if (taskFilter.search) query.push(`title=${taskFilter.search}`);
      if (taskFilter.assignedTo) query.push(`assignedTo=${taskFilter.assignedTo}`);
      if (taskFilter.dueFrom) query.push(`dueFrom=${taskFilter.dueFrom}`);
      if (taskFilter.dueTo) query.push(`dueTo=${taskFilter.dueTo}`);
      const queryString = query.length ? "?" + query.join("&") : "";

      const resTasks = await getTasks(boardId + queryString);
      const grouped = {};
      resCols.data.forEach((col) => (grouped[col._id] = []));
      resTasks.data.forEach((task) => {
        if (grouped[task.column]) grouped[task.column].push(task);
      });

      setColumns((prev) =>
        prev.map((col) => ({ ...col, tasks: grouped[col._id] || [] }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Add new board
  const handleAddBoard = async (e) => {
    e.preventDefault();
    if (!newBoard.name || !newBoard.description) return alert("Fill all fields");
    try {
      const res = await createBoard(newBoard);
      setBoards((prev) => [...prev, res.data]);
      setSelectedBoard(res.data);
      setNewBoard({ name: "", description: "" });
    } catch (err) {
      console.error(err);
    }
  };

  // Add new column
  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColumn.title) return alert("Enter column title");
    try {
      await createColumn(selectedBoard._id, newColumn);
      setNewColumn({ title: "", position: 0 });
      fetchColumnsAndTasks(selectedBoard._id);
      socket.emit("boardChanged", selectedBoard._id);
    } catch (err) {
      console.error(err);
    }
  };

  // Add new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.description || !newTask.column) return alert("Fill all fields");
    try {
      await createTask(selectedBoard._id, newTask);
      setNewTask({ title: "", description: "", column: "" });
      fetchColumnsAndTasks(selectedBoard._id);
      socket.emit("boardChanged", selectedBoard._id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  useEffect(() => {
    if (selectedBoard) fetchColumnsAndTasks(selectedBoard._id);
  }, [selectedBoard, taskFilter]);

  useEffect(() => {
    socket.on("boardChanged", () => {
      if (selectedBoard) fetchColumnsAndTasks(selectedBoard._id);
    });
    return () => socket.off("boardChanged");
  }, [selectedBoard]);

  if (!selectedBoard) return <div>Loading boards...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <button onClick={onLogout}>Logout</button>
      </div>

      {/* Add Board Form */}
      <form onSubmit={handleAddBoard} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Board Name"
          value={newBoard.name}
          onChange={(e) => setNewBoard({ ...newBoard, name: e.target.value })}
          style={{ marginRight: "10px" }}
        />
        <input
          type="text"
          placeholder="Description"
          value={newBoard.description}
          onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
          style={{ marginRight: "10px" }}
        />
        <button type="submit">Add Board</button>
      </form>

      {/* Boards Table */}
      <table border="1" cellPadding="5" style={{ marginBottom: "20px", width: "100%" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Created By</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {boards.map((board) => (
            <tr key={board._id}>
              <td>{board.name}</td>
              <td>{board.description}</td>
              <td>{board.createdBy?.name || "N/A"}</td>
              <td>
                <button onClick={() => setSelectedBoard(board)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{selectedBoard.name}</h2>

      {/* Add Column Form */}
      <form onSubmit={handleAddColumn} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Column Title"
          value={newColumn.title}
          onChange={(e) => setNewColumn({ ...newColumn, title: e.target.value })}
          style={{ marginRight: "10px" }}
        />
        <button type="submit">Add Column</button>
      </form>

      {/* Add Task Form - Only if columns exist */}
      {columns.length > 0 && (
        <form onSubmit={handleAddTask} style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Task Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            style={{ marginRight: "10px" }}
          />
          <input
            type="text"
            placeholder="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            style={{ marginRight: "10px" }}
          />
          <select
            value={newTask.column}
            onChange={(e) => setNewTask({ ...newTask, column: e.target.value })}
            style={{ marginRight: "10px" }}
          >
            <option value="">Select Column</option>
            {columns.map((col) => (
              <option key={col._id} value={col._id}>
                {col.title}
              </option>
            ))}
          </select>
          <button type="submit">Add Task</button>
        </form>
      )}

      {/* Task Filters */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search title"
          value={taskFilter.search}
          onChange={(e) => setTaskFilter({ ...taskFilter, search: e.target.value })}
          style={{ marginRight: "10px" }}
        />
        <input
          type="text"
          placeholder="Assigned to userId"
          value={taskFilter.assignedTo}
          onChange={(e) => setTaskFilter({ ...taskFilter, assignedTo: e.target.value })}
          style={{ marginRight: "10px" }}
        />
        <input
          type="date"
          placeholder="Due from"
          value={taskFilter.dueFrom}
          onChange={(e) => setTaskFilter({ ...taskFilter, dueFrom: e.target.value })}
          style={{ marginRight: "10px" }}
        />
        <input
          type="date"
          placeholder="Due to"
          value={taskFilter.dueTo}
          onChange={(e) => setTaskFilter({ ...taskFilter, dueTo: e.target.value })}
          style={{ marginRight: "10px" }}
        />
      </div>

      {/* Columns & Tasks */}
      <div style={{ display: "flex", gap: "20px" }}>
        {columns.map((col) => (
          <Column key={col._id} column={col} socket={socket} />
        ))}
      </div>
    </div>
  );
};

export default BoardPage;
