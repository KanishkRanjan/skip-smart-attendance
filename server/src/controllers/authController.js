const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../prisma');

const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '7d',
        });

        res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user', error });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '7d',
        });

        res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

module.exports = { register, login };
