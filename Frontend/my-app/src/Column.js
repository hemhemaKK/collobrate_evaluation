import React from "react";
import TaskCard from "./TaskCard";

const Column = ({ column, token, socket }) => {
  return (
    <div
      style={{
        backgroundColor: "#f0f0f0",
        padding: "10px",
        width: "250px",
        borderRadius: "5px",
      }}
    >
      <h3>{column.title}</h3>
      <div>
        {column.tasks &&
          column.tasks.map((task) => (
            <TaskCard key={task._id} task={task} token={token} socket={socket} />
          ))}
      </div>
    </div>
  );
};

export default Column;
