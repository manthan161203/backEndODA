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
    //         const admin = await Admin.create({ user, assignedDepartments });

    //         return res.status(201).json(admin);
    //     } catch (err) {
    //         return res.status(500).json({ message: err.message });
    //     }
    // },

    // Update admin details by userName
    // updateAdminByUserName: async (req, res) => {
    //     try {
    //         const { userName } = req.params;
    //         const { assignedDepartments } = req.body;

    //         const updatedAdmin = await Admin.aggregate([
    //             {
    //                 $lookup: {
    //                     from: 'users',
    //                     localField: 'user',
    //                     foreignField: '_id',
    //                     as: 'user'
    //                 }
    //             },
    //             {
    //                 $unwind: '$user'
    //             },
    //             {
    //                 $match: {
    //                     'user.userName': userName
    //                 }
    //             },
    //             {
    //                 $set: {
    //                     assignedDepartments: assignedDepartments
    //                 }
    //             },
    //             {
    //                 $merge: {
    //                     into: 'admins',
    //                     whenMatched: 'replace',
    //                 }
    //             }
    //         ]);

    //         if (!updatedAdmin) {
    //             return res.status(404).json({ message: 'Admin not found' });
    //         }

    //         return res.status(200).json(updatedAdmin);
    //     } catch (err) {
    //         return res.status(500).json({ message: err.message });
    //     }
    // },

    // Delete an admin by userName
    deleteAdminByUserName: async (req, res) => {
        try {
            const { userName } = req.params;
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
                    $unwind: '$userDetails'
                },
                {
                    $match: {
                        'userDetails.userName': userName
                    }
                },
                {
                    $project: {
                        userDetails: 0
                    }
                },
                {
                    $facet: {
                        toDelete: [
                            {
                                $match: {
                                    user: { $exists: true }
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: '$toDelete',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $replaceRoot: { newRoot: '$toDelete' }
                }
            ]);
            if (!deletedAdmin) {
                return res.status(404).json({ message: 'Admin not found' });
            }
            const adminIdsToDelete = deletedAdmin.map(admin => admin._id);

            await Admin.deleteMany({ _id: { $in: adminIdsToDelete } });

            return res.status(200).json({ message: 'Admin deleted successfully' });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },
};

module.exports = superAdminController;
