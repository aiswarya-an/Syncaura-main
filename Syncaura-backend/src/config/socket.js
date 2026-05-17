import pool from "./db.js";

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-channel", async ({ channelId, userId }) => {
      try {
        const result = await pool.query("SELECT * FROM channels WHERE id = $1", [channelId]);
        if (result.rowCount === 0) {
          socket.emit("error", "Channel not found");
          return;
        }
        const channel = result.rows[0];

        if (channel.is_private) {
          const memberCheck = await pool.query(
            "SELECT 1 FROM channel_members WHERE channel_id = $1 AND user_id = $2",
            [channelId, userId]
          );
          if (memberCheck.rowCount === 0) {
            socket.emit("error", "Not allowed to join this private chat");
            return;
          }
        }
        socket.join(channelId);
      } catch (err) {
        console.error(err);
        socket.emit("error", "Server error joining channel");
      }
    });

    socket.on("leave-channel", (channelId) => {
      socket.leave(channelId);
    });

    // Handle text messages
    socket.on("message:text", async ({ channelId, senderId, text }) => {
      try {
        const result = await pool.query(
          "INSERT INTO messages (channel_id, sender_id, text, message_type) VALUES ($1, $2, $3, $4) RETURNING *",
          [channelId, senderId, text, "text"]
        );
        const message = result.rows[0];
        io.to(channelId).emit("message:new", message);
      } catch (err) {
        console.error(err);
        socket.emit("error", "Server error sending message");
      }
    });

    // Handle file messages
    socket.on("message:file", async ({ channelId, senderId, fileUrl }) => {
      try {
        const result = await pool.query(
          "INSERT INTO messages (channel_id, sender_id, file_url, message_type) VALUES ($1, $2, $3, $4) RETURNING *",
          [channelId, senderId, fileUrl, "file"]
        );
        const message = result.rows[0];
        io.to(channelId).emit("message:new", message);
      } catch (err) {
        console.error(err);
        socket.emit("error", "Server error sending file message");
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

export default socketHandler;