const express = require('express');
const { markAttendance, getDashboardStats, getUpcomingSessions, createSession, deleteSession, markPastSessions } = require('../controllers/attendanceController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.post('/mark', markAttendance);
router.get('/stats/:semesterId', getDashboardStats);
router.get('/upcoming/:semesterId', getUpcomingSessions);
router.post('/session', createSession);
router.delete('/session/:id', deleteSession);
router.post('/mark-past', markPastSessions);

module.exports = router;
