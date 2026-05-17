import express from "express";


import { createMeeting ,updateMeeting,deleteMeeting, getMeetings, getMeetingById} from "../controllers/meetingController.js";
import {auth} from "../middlewares/auth.js";

const router = express.Router();
router.post("/", auth, createMeeting);
router.get("/", auth, getMeetings);
router.get("/:id", auth, getMeetingById);
router.put("/:id", auth, updateMeeting);
router.delete("/:id", auth, deleteMeeting);

export default router;

