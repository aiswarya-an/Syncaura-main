import express from "express";
const router = express.Router();
import { auth } from "../middlewares/auth.js";
import { permit } from "../middlewares/role.js";
import {getChannels} from "../controllers/channelController.js";
import {getChannelById} from "../controllers/channelController.js";
import ROLES from "../config/roles.js";

import {
  createChannel,
  joinChannel,
  leaveChannel,
  getPublicChannels
} from "../controllers/channelController.js";

router.post(
  "/",
  auth,
  
  createChannel
);

router.post("/:channelId/join", auth, joinChannel);
router.post("/:channelId/leave", auth, leaveChannel);
router.get("/",auth,getChannels);
router.get("/:id",auth,getChannelById);

export default router;