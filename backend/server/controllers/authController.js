const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const generateToken = require('../utils/generateToken');
const sendSMS = require('../utils/sendSMS');
const sendWelcomeEmail = require('../utils/sendEmail');

// @desc    Register a new user (Handles Patient, User Accounts, SMS & Email Notifications)
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    let savedUser = null;
    let savedProfile = null;

    try {
        console.log("\n=========================================");
        console.log("📥 [AUTH REGISTER] Processing Registration Request...");

        const {
            email,
            password,
            role = 'Patient',
            fullName,
            nic,
            dob,
            gender,
            phone,
            phoneNumber,
            contactNo,
            mobile,
            bloodGroup,
            address,
            guardianName,
            guardianPhone,
            patientId,
            qrCodeData
        } = req.body;

        // Resolve phone key across common field variations
        const recipientPhone = phone || phoneNumber || contactNo || mobile;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required.' 
            });
        }

        const cleanEmail = String(email).toLowerCase().trim();

        // 1. Check if User account already exists
        const userExists = await User.findOne({ email: cleanEmail });
        if (userExists) {
            return res.status(400).json({ 
                success: false, 
                message: 'An account with this email address already exists.' 
            });
        }

        // 2. Validate Patient Profile prerequisites if role is Patient
        if (role === 'Patient') {
            if (!fullName || !nic || !dob || !recipientPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing patient fields: Full Name, NIC, DOB, and Phone are required.'
                });
            }

            const cleanNic = String(nic).trim();
            const existingProfile = await PatientProfile.findOne({
                $or: [{ nic: cleanNic }, { email: cleanEmail }]
            });

            if (existingProfile) {
                return res.status(400).json({
                    success: false,
                    message: 'A medical profile matching this NIC or Email already exists.'
                });
            }
        }

        // 3. Create User Account Credentials
        savedUser = await User.create({ 
            email: cleanEmail, 
            password, 
            role 
        });
        console.log("✅ User account created in MongoDB:", savedUser._id);

        // 4. Create Medical Profile, Dispatch SMS & Send Email (If Patient)
        if (role === 'Patient') {
            const cleanPhone = String(recipientPhone).trim();
            const cleanNic = String(nic).trim();
            const dobObject = new Date(dob);

            const generatedId = patientId || `PAT-${Math.floor(100000 + Math.random() * 900000)}`;
            const qrData = qrCodeData || `MEDNET-VALIDATION-NODE-${generatedId}-${cleanNic}`;

            // Format DOB digits for temporary password display (YYYYMMDD)
            const cleanDobPassword = dob 
                ? String(dob).replace(/\D/g, '') 
                : (!isNaN(dobObject.getTime()) ? dobObject.toISOString().split('T')[0].replace(/-/g, '') : '');

            savedProfile = await PatientProfile.create({
                user: savedUser._id,
                patientId: generatedId,
                fullName: fullName.trim(),
                nic: cleanNic,
                dob: !isNaN(dobObject.getTime()) ? dobObject : new Date(),
                gender: gender || 'Other',
                phone: cleanPhone,
                bloodGroup: bloodGroup || 'N/A',
                address: address ? address.trim() : 'N/A',
                email: cleanEmail,
                guardianName: guardianName ? guardianName.trim() : 'N/A',
                guardianPhone: guardianPhone ? guardianPhone.trim() : 'N/A',
                qrCodeData: qrData
            });

            console.log("✅ Patient Profile created in MongoDB!");

            // Professional, Secure SMS Notice (No raw password in text)
            const smsMessage = 
                `Medicare Health System: Welcome ${fullName}! ` +
                `Your account registration is complete. ` +
                `Patient ID: ${generatedId}. ` +
                `Your temporary password is your Date of Birth in YYYYMMDD format. ` +
                `Please log in and update your credentials.`;

            // Isolated background SMS dispatch
            // sendSMS(cleanPhone, smsMessage)
            //     .then((smsResult) => {
            //         console.log("🎉 SMS successfully dispatched via Notify.lk:", smsResult);
            //     })
            //     .catch((smsErr) => {
            //         console.error("⚠️ SMS Warning (Profile saved successfully):", smsErr.message);
            //     });

            // Isolated background Welcome Email dispatch
            // Background Welcome Email dispatch with portal authentication link
            sendWelcomeEmail(cleanEmail, fullName, generatedId)
                .then((emailResult) => {
                    if (emailResult) {
                        console.log("✉️ Welcome Email successfully sent to:", cleanEmail);
                    } else {
                        console.warn("⚠️ Email was skipped or failed silently for:", cleanEmail);
                    }
                })
                .catch((emailErr) => {
                    console.error("⚠️ Email Warning (Profile saved successfully):", emailErr.message);
                });
        }

        console.log("=========================================\n");

        return res.status(201).json({
            success: true,
            message: 'User account created successfully. Welcome SMS and Email dispatched.',
            email: savedUser.email,
            role: savedUser.role,
            patientProfile: savedProfile
        });

    } catch (error) {
        console.error("❌ Registration Server Error:", error.message);

        // Transaction Rollback: Clean up dangling records if any step fails
        if (savedProfile?._id) {
            await PatientProfile.findByIdAndDelete(savedProfile._id);
        }
        if (savedUser?._id) {
            await User.findByIdAndDelete(savedUser._id);
        }

        return res.status(500).json({ 
            success: false, 
            message: 'Server internal registration error', 
            error: error.message 
        });
    }
};

// @desc    Authenticate user & return JWT token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    const { email, password, role, rememberMe } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password.' });
        }

        const user = await User.findOne({ email: String(email).toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (role && user.role !== role) {
            return res.status(403).json({ 
                message: `Access denied. You are not registered as a ${role}.` 
            });
        }

        if (await user.matchPassword(password)) {
            const token = generateToken(res, user._id, user.role, rememberMe);

            return res.status(200).json({
                _id: user._id,
                email: user.email,
                role: user.role,
                token: token,
                message: 'Login successful' 
            });
        } else {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        return res.status(500).json({ 
            message: 'Server error during login', 
            error: error.message 
        });
    }
};

module.exports = { loginUser, registerUser };