const { prisma } = require('../prisma');

const createSemester = async (req, res) => {
    try {
        const { name, startDate, endDate } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const semester = await prisma.semester.create({
            data: {
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                userId,
            },
        });

        res.status(201).json(semester);
    } catch (error) {
        res.status(500).json({ message: 'Error creating semester', error });
    }
};

const getSemesters = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const semesters = await prisma.semester.findMany({
            where: { userId },
            include: { subjects: true },
            orderBy: { startDate: 'desc' },
        });

        res.json(semesters);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching semesters', error });
    }
};

const createSubject = async (req, res) => {
    try {
        const { name, code, color, semesterId, schedule, targetPercentage } = req.body;
        // schedule: [{ day: 'Monday', startTime: '10:00', endTime: '11:00' }]

        // Check if subject with same code exists in this semester
        let subject;
        let isNewSubject = true;

        if (code) {
            const existingSubject = await prisma.subject.findFirst({
                where: {
                    semesterId,
                    code
                }
            });

            if (existingSubject) {
                subject = existingSubject;
                isNewSubject = false;

                // Merge schedule
                // We need to parse existing schedule (it's JSON)
                let existingSchedule = existingSubject.schedule;
                if (typeof existingSchedule === 'string') {
                    try { existingSchedule = JSON.parse(existingSchedule); } catch (e) { existingSchedule = []; }
                }
                if (!Array.isArray(existingSchedule)) existingSchedule = [];

                // Append new schedule items
                const updatedSchedule = [...existingSchedule, ...schedule];

                // Update subject with new schedule
                await prisma.subject.update({
                    where: { id: subject.id },
                    data: { schedule: updatedSchedule }
                });
            }
        }

        if (isNewSubject) {
            subject = await prisma.subject.create({
                data: {
                    name,
                    code,
                    color,
                    semesterId,
                    schedule, // Saved as JSON
                    targetPercentage: targetPercentage || 75.0,
                },
            });
        }

        // Generate ClassSessions
        const semester = await prisma.semester.findUnique({ where: { id: semesterId } });
        if (semester && Array.isArray(schedule)) {
            const sessionsToCreate = [];
            const start = new Date(semester.startDate);
            const end = new Date(semester.endDate);

            // Map day names to getDay() values
            const dayMap = {
                'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
            };

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const currentDay = d.getDay();
                // Check if this day is in the NEW schedule only
                // schedule example: [{ day: 'Monday', startTime: '10:00', endTime: '11:00' }]
                const schedulesForDay = schedule.filter((s) => dayMap[s.day] === currentDay);

                for (const s of schedulesForDay) {
                    // Construct start and end Date objects for the session
                    const sessionStart = new Date(d);
                    const [startHour, startMin] = s.startTime.split(':');
                    sessionStart.setHours(parseInt(startHour), parseInt(startMin));

                    const sessionEnd = new Date(d);
                    const [endHour, endMin] = s.endTime.split(':');
                    sessionEnd.setHours(parseInt(endHour), parseInt(endMin));

                    sessionsToCreate.push({
                        date: new Date(d),
                        startTime: sessionStart,
                        endTime: sessionEnd,
                        subjectId: subject.id,
                        status: 'PENDING'
                    });
                }
            }

            if (sessionsToCreate.length > 0) {
                // Prisma createMany is supported in MySQL
                await prisma.classSession.createMany({
                    data: sessionsToCreate
                });
            }
        }

        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ message: 'Error creating subject', error });
    }
};

const getSubjects = async (req, res) => {
    try {
        const { semesterId } = req.params;
        const subjects = await prisma.subject.findMany({
            where: { semesterId },
            include: { sessions: true },
        });
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subjects', error });
    }
};

module.exports = { createSemester, getSemesters, createSubject, getSubjects };
