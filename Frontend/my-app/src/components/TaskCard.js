import React from "react";

const TaskCard = ({ task }) => {
  return (
    <div style={{ border: "1px solid gray", margin: "5px", padding: "5px" }}>
      <h5>{task.title}</h5>
      <p>{task.description}</p>
      <p>Assigned To: {task.assignedTo}</p>
      <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
    </div>
  );
};

export default TaskCard;
