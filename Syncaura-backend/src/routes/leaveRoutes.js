import express from 'express';
import {auth} from '../middlewares/auth.js';
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave
} from '../controllers/leaveController.js';

const router = express.Router();

router.post('/applyleave', auth, applyLeave);
router.get('/myleaves', auth, getMyLeaves);
router.get('/allleaves', auth, getAllLeaves);
router.put('/:id/approve', auth, approveLeave);
router.put('/:id/reject', auth, rejectLeave);

export default router;
