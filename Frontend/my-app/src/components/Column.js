import React, { useEffect, useState } from "react";
import TaskCard from "./TaskCard";
import { getTasks } from "../services/api";

const Column = ({ column, socket }) => {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const res = await getTasks(column.board);
      const columnTasks = res.data.filter((task) => task.column === column._id);
      setTasks(columnTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    socket.on("taskUpdated", fetchTasks);
    return () => socket.off("taskUpdated", fetchTasks);
  }, []);

  return (
    <div style={{ border: "1px solid black", padding: "10px", minWidth: "200px" }}>
      <h4>{column.title}</h4>
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} />
      ))}
    </div>
  );
};

export default Column;
