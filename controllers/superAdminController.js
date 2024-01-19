const Admin = require('../models/adminSchema');
const User = require('../models/userSchema');

const superAdminController = {
    // Retrieve all admins
    getAllAdmins: async (req, res) => {
        try {
            const admins = await Admin.find().populate('user').exec();

            return res.status(200).json(admins);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // Retrieve admin by user userName
    getByUserName: async (req, res) => {
        try {
            const { userName } = req.params;
            
            // const reqUser = await User.findOne({ 'userName': userName });
            const admin = await Admin.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $match: {
                        'user.userName': userName
                    }
                },
                {
                    $limit: 1
                }
            ]);
            console.log(userName);
            if (!admin) {
                return res.status(404).json({ message: 'Admin not found for the given username' });
            }

            return res.status(200).json(admin);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // Retrieve admins by department
    getByDepartment: async (req, res) => {
        try {
            const { department } = req.params;
            const admins = await Admin.find({ assignedDepartments: department }).populate('user').exec();

            if (!admins || admins.length === 0) {
                return res.status(404).json({ message: 'No admins found for the given department' });
            }

            return res.status(200).json(admins);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // Create a new admin
    // createAdmin: async (req, res) => {
    //     try {
    //         const { user, assignedDepartments } = req.body;
    //         const userData = await User.create({ user });

    //         const admin = await Admin.create({ assignedDepartments });
    //         console.log(userData);
    //         return res.status(201).json(admin);
    //     } catch (err) {
    //         return res.status(500).json({ message: err.message });
    //     }
    // },

    // Update user data of Admin by userName
    updateUserDataOfAdminByUserName: async (req, res) => {
        try {
            const { userName } = req.params;
            const updatedData = req.body;

            const updatedUser = await User.findOneAndUpdate(
                { userName: userName },
                { $set: updatedData },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json(updatedUser);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // Update admin details by userName
    updateAdminDataByUserName: async (req, res) => {
        try {
            const { userName } = req.params;
            const updatedData = req.body;
            await Admin.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'userData'
                    }
                },
                {
                    $match: {
                        'userData.userName': userName
                    }
                },
                {
                    $set: updatedData
                },
                {
                    $project: {
                        user: 1,
                        _id: 1,
                        assignedDepartments: 1
                    }
                },
                {
                    $merge: {
                        into: 'admins',
                        whenMatched: 'merge'
                    }
                }
            ]);
    
            return res.status(200).json({ message: 'Admin Updated Successfully' });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // Delete an admin by userName
    deleteAdminByUserName: async (req, res) => {
        try {
            const { userName } = req.params;
            // console.log(userName);
            const deletedAdmin = await Admin.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                {
                    $match: {
                        'userDetails.userName': userName
                    }
                },
                {
                    $project: {
                        user: 1,
                        _id: 1
                    }
                }
            ]);
            // console.log(deletedAdmin);
            const { user, _id } = deletedAdmin[0];

            const deletionResult = await Admin.deleteOne({ user, _id });
            const deletedUser = await User.deleteOne({ userName: userName });

            if (deletionResult.deletedCount === 0 && !deletedUser) {
                return res.status(404).json({ message: 'Admin not found' });
            }

            return res.status(200).json({ message: 'Admin deleted successfully' });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },
};

module.exports = superAdminController;
