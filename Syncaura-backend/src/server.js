import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { Server } from "socket.io";
import socketHandler from "./config/socket.js";
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

socketHandler(io);
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
