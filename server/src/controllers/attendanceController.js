const { prisma } = require('../prisma');
const { calculateSubjectStats } = require('../utils/skipCalculator');

const markAttendance = async (req, res) => {
    try {
        const { sessionId, status } = req.body; // status: 'ATTENDED' | 'SKIPPED' | 'CANCELLED'

        const session = await prisma.classSession.update({
            where: { id: sessionId },
            data: { status },
        });

        res.json(session);
    } catch (error) {
        res.status(500).json({ message: 'Error marking attendance', error });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const { semesterId } = req.params;

        // Fetch all subjects with their sessions
        const subjects = await prisma.subject.findMany({
            where: { semesterId },
            include: {
                sessions: {
                    orderBy: { date: 'asc' }
                }
            }
        });

        const stats = subjects.map(subject => {
            return calculateSubjectStats({
                id: subject.id,
                name: subject.name,
                targetPercentage: subject.targetPercentage,
                sessions: subject.sessions
            });
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error });
    }
};

const getUpcomingSessions = async (req, res) => {
    try {
        const { semesterId } = req.params;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sessions = await prisma.classSession.findMany({
            where: {
                subject: { semesterId },
                date: { gte: today },
                status: 'PENDING'
            },
            include: { subject: true },
            orderBy: { startTime: 'asc' },
            take: 10
        });

        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching upcoming sessions', error });
    }
}

const createSession = async (req, res) => {
    try {
        const { subjectId, date, startTime, endTime } = req.body;

        const session = await prisma.classSession.create({
            data: {
                subjectId,
                date: new Date(date),
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                status: 'PENDING'
            }
        });

        res.json(session);
    } catch (error) {
        res.status(500).json({ message: 'Error creating session', error });
    }
};

const deleteSession = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.classSession.delete({
            where: { id }
        });

        res.json({ message: 'Session deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting session', error });
    }
};

const markPastSessions = async (req, res) => {
    try {
        const { semesterId } = req.body;
        const now = new Date();

        const result = await prisma.classSession.updateMany({
            where: {
                subject: { semesterId },
                endTime: { lt: now },
                status: 'PENDING'
            },
            data: {
                status: 'SKIPPED'
            }
        });

        res.json({ message: 'Past sessions marked as skipped', count: result.count });
    } catch (error) {
        res.status(500).json({ message: 'Error marking past sessions', error });
    }
};

module.exports = { markAttendance, getDashboardStats, getUpcomingSessions, createSession, deleteSession, markPastSessions };
