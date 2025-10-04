
import React from "react";
import axios from "axios";

const TaskCard = ({ task, token, socket }) => {
  const deleteTask = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/task/${task._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      socket.emit("taskUpdated", { action: "delete", taskId: task._id });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        padding: "8px",
        marginBottom: "8px",
        borderRadius: "4px",
        boxShadow: "0px 1px 3px rgba(0,0,0,0.2)",
      }}
    >
      <h4>{task.title}</h4>
      <p>{task.description}</p>
      <p>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}</p>
      <button onClick={deleteTask}>Delete</button>
    </div>
  );
};

export default TaskCard;
