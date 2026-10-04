const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const registerUser = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ email, password, role });
        res.status(201).json({ message: 'User created successfully', email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password, role, rememberMe } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.role !== role) {
            return res.status(403).json({ message: `Access denied. You are not registered as a ${role}.` });
        }

        if (await user.matchPassword(password)) {
            const token = generateToken(res, user._id, user.role, rememberMe);

            res.status(200).json({
                _id: user._id,
                email: user.email,
                role: user.role,
                token: token,
                message: 'Login successful' 
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



module.exports = { loginUser, registerUser };