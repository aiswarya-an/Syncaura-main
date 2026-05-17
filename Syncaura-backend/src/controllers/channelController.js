import pool from "../config/db.js";

export const createChannel = async (req, res) => {
  try {
    const { name } = req.body;

    const result = await pool.query(
      "INSERT INTO channels (name, created_by, is_public) VALUES ($1, $2, true) RETURNING *",
      [name, req.user.id]
    );

    const channel = result.rows[0];

    // Add creator as member
    await pool.query(
      "INSERT INTO channel_members (channel_id, user_id) VALUES ($1, $2)",
      [channel.id, req.user.id]
    );

    res.status(201).json({ message: "Channel created", channel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Join Channel
export const joinChannel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { channelId } = req.params;

    const channelResult = await pool.query("SELECT * FROM channels WHERE id = $1", [channelId]);
    if (channelResult.rowCount === 0) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const channel = channelResult.rows[0];

    if (channel.is_private) {
      const allowedCheck = await pool.query(
        "SELECT 1 FROM channel_allowed_users WHERE channel_id = $1 AND user_id = $2",
        [channelId, userId]
      );
      if (allowedCheck.rowCount === 0) return res.status(403).json({ message: "Private channel" });
    }

    const membersCountResult = await pool.query(
      "SELECT COUNT(*) FROM channel_members WHERE channel_id = $1",
      [channelId]
    );
    if (parseInt(membersCountResult.rows[0].count) >= channel.max_members) {
      return res.status(403).json({ message: `Channel is full (max ${channel.max_members} users)` });
    }

    const memberCheck = await pool.query(
      "SELECT 1 FROM channel_members WHERE channel_id = $1 AND user_id = $2",
      [channelId, userId]
    );
    if (memberCheck.rowCount > 0) {
      return res.status(400).json({ message: "Already joined" });
    }

    await pool.query(
      "INSERT INTO channel_members (channel_id, user_id) VALUES ($1, $2)",
      [channelId, userId]
    );

    res.json({ message: "Joined channel successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getChannels = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.* FROM channels c 
       JOIN channel_members cm ON c.id = cm.channel_id 
       WHERE cm.user_id = $1`,
      [req.user.id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Leave Channel
export const leaveChannel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { channelId } = req.params;

    await pool.query(
      "DELETE FROM channel_members WHERE channel_id = $1 AND user_id = $2",
      [channelId, userId]
    );

    res.json({ message: "Left channel successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Channel by ID
export const getChannelById = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM channels WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const channel = result.rows[0];

    // Get members
    const membersResult = await pool.query(
      "SELECT u.id, u.name, u.email FROM channel_members cm JOIN users u ON cm.user_id = u.id WHERE cm.channel_id = $1",
      [channel.id]
    );
    channel.members = membersResult.rows;

    res.json(channel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createPrivateChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ message: "Other user required" });
    }

    // Check if private chat already exists
    const existingResult = await pool.query(
      `SELECT c.* FROM channels c
       JOIN channel_allowed_users cau1 ON c.id = cau1.channel_id
       JOIN channel_allowed_users cau2 ON c.id = cau2.channel_id
       WHERE c.is_private = true AND cau1.user_id = $1 AND cau2.user_id = $2`,
      [userId, otherUserId]
    );

    if (existingResult.rowCount > 0) {
      return res.status(200).json(existingResult.rows[0]);
    }

    const result = await pool.query(
      "INSERT INTO channels (name, is_private, is_public, max_members, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      ["private-chat", true, false, 2, userId]
    );

    const channel = result.rows[0];

    // Add allowed users
    await pool.query("INSERT INTO channel_allowed_users (channel_id, user_id) VALUES ($1, $2), ($1, $3)", [channel.id, userId, otherUserId]);
    
    // Add members
    await pool.query("INSERT INTO channel_members (channel_id, user_id) VALUES ($1, $2), ($1, $3)", [channel.id, userId, otherUserId]);

    res.status(201).json(channel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all public channels
export const getPublicChannels = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM channels WHERE is_public = true AND is_private = false"
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

