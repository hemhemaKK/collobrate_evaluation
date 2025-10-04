// src/services/api.js
import axios from "axios";

// Base URL of your backend
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add JWT token automatically to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ====================== Auth ======================
export const loginUser = (data) => API.post("/user/login", data);
export const registerUser = (data) => API.post("/user/register", data);

// ====================== Boards ======================
export const getBoards = () => API.get("/board");
export const createBoard = (data) => API.post("/board", data);
export const deleteBoard = (boardId) => API.delete(`/board/${boardId}`);

// ====================== Columns ======================
export const getColumns = (boardId) => API.get(`/board/${boardId}/columns`);
export const createColumn = (boardId, data) =>
  API.post(`/board/${boardId}/columns`, data);

// ====================== Tasks ======================
export const getTasks = (boardId, query = "") =>
  API.get(`/task/board/${boardId}${query}`);
export const createTask = (data) => API.post("/task", data);
export const updateTask = (taskId, data) => API.put(`/task/${taskId}`, data);
export const deleteTask = (taskId) => API.delete(`/task/${taskId}`);

