import React, { useState, useEffect } from "react";
import axios from "axios";
import Column from "./Column";

const Board = ({ board, token, socket }) => {
  const [columns, setColumns] = useState([]);
  const [search, setSearch] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueFrom, setDueFrom] = useState("");
  const [dueTo, setDueTo] = useState("");

  const fetchColumns = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/board/columns/${board._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setColumns(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTasks = async () => {
    try {
      let query = [];
      if (search) query.push(`title=${search}`);
      if (assignedTo) query.push(`assignedTo=${assignedTo}`);
      if (dueFrom) query.push(`dueFrom=${dueFrom}`);
      if (dueTo) query.push(`dueTo=${dueTo}`);
      const queryString = query.length ? "?" + query.join("&") : "";

      const res = await axios.get(
        `http://localhost:3000/api/task/board/${board._id}${queryString}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Group tasks by column
      const grouped = {};
      columns.forEach((col) => (grouped[col._id] = []));
      res.data.forEach((task) => {
        if (grouped[task.column]) grouped[task.column].push(task);
      });

      setColumns((prev) =>
        prev.map((col) => ({ ...col, tasks: grouped[col._id] || [] }))
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchColumns();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [search, assignedTo, dueFrom, dueTo, columns.length]);

  // Socket.IO real-time updates
  useEffect(() => {
    socket.on("taskUpdated", () => {
      fetchTasks();
    });
    return () => socket.off("taskUpdated");
  }, [columns]);

  return (
    <div>
      <h2>{board.name}</h2>

      {/* Search & Filters */}
      <div style={{ margin: "10px 0" }}>
        <input
          type="text"
          placeholder="Search by title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="Assigned to userId"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
        />
        <input
          type="date"
          placeholder="Due from"
          value={dueFrom}
          onChange={(e) => setDueFrom(e.target.value)}
        />
        <input
          type="date"
          placeholder="Due to"
          value={dueTo}
          onChange={(e) => setDueTo(e.target.value)}
        />
      </div>

      {/* Columns */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {columns.map((col) => (
          <Column key={col._id} column={col} token={token} socket={socket} />
        ))}
      </div>
    </div>
  );
};

export default Board;
