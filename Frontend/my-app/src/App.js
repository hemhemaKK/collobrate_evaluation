import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import Board from "./components/Board";

const socket = io("http://localhost:3000"); // backend URL

function App() {
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // Fetch boards
  const fetchBoards = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/board", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBoards(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchBoards();

    // Socket.IO event listener
    socket.on("boardCreated", (board) => {
      setBoards((prev) => [...prev, board]);
    });

    return () => {
      socket.off("boardCreated");
    };
  }, []);

  return (
    <div>
      <h1>Kanban Boards</h1>
      <div style={{ display: "flex", gap: "10px" }}>
        {boards.map((b) => (
          <button key={b._id} onClick={() => setSelectedBoard(b)}>
            {b.name}
          </button>
        ))}
      </div>

      {selectedBoard && (
        <Board board={selectedBoard} token={token} socket={socket} />
      )}
    </div>
  );
}

export default App;
