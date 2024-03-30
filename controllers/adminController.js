const UnifiedDoctor = require("../models/unifiedDoctorSchema");
const Hospital = require("../models/hospitalSchema");
const User = require("../models/userSchema");
const Admin = require("../models/adminSchema");
const mongoose = require('mongoose');

const adminController = {
    // Get doctors by type, specialization
    getDoctors: async (req, res) => {
        try {
            const { doctorType, doctorSpecialization } = req.body;
            const query = {};
            if (doctorType) {
                query.doctorType = doctorType;
            } 
            if (doctorSpecialization) {
                query.doctorSpecialization = doctorSpecialization;
            }
            // console.log(query);
    
            const doctors = await UnifiedDoctor.find(query).populate('user');
            res.status(200).json(doctors);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    getRoleBasedDetails: async (req, res) => {
        try {
            const { userName } = req.params;
            // console.log(userName);
    
            const data = await Admin.aggregate([
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
                    $unwind: '$user',
                },
                {
                    $limit: 1
                }
            ]);
            res.status(200).send(data);
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error"});
        }
    },

    createAdmin: async (req, res) => {
        console.log("Hi")
        try {
            const adminData = req.body;
            console.log(adminData)
            const userId = adminData.user;
            if (!userId) {
                return res.status(400).json({ message: 'User ID is required.' });
            }
    
            let userObjectId;
            try {
                userObjectId = mongoose.Types.ObjectId.createFromHexString(userId);
            } catch (error) {
                return res.status(400).json({ message: 'Invalid User ID format.' });
            }
    
            adminData.user = userObjectId;
    
            const createdAdmin = await Admin.create(adminData);
    
            return res.status(200).json({ message: 'Admin Created Successfully', admin: createdAdmin });
        } catch (error) {
            console.error('Error creating admin:', error.message);
            return res.status(500).json({ message: 'Error creating admin', error: error.message });
        }
    },

    // Get doctors by hospitalID
    getDoctorsByHospitalID : async (req, res) => {
        try {
            const { hospitalID } = req.body;
    
            const doctors = await UnifiedDoctor.aggregate([
                {
                    $lookup: {
                        from: 'hospitals',
                        localField: 'hospitalID',
                        foreignField: '_id',
                        as: 'hospitalDetails'
                    }
                },
                {
                    $unwind: '$hospitalDetails'
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $match: {
                        'hospitalDetails.hospitalId': hospitalID ,
                    }
                }
            ]);

            // const hospital = await Hospital.findOne({ hospitalId: hospitalID });
                
            // if (!hospital) {
            //     return res.status(404).json({ error: 'Hospital not found' });
            // }
    
            // const doctors = await UnifiedDoctor.find({ hospitalID: hospital._id }).populate('user').populate('hospitalID');
            res.status(200).json(doctors);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error retrieving doctors by Hospital ID' });
        }   
    },
    
    // Get Doctor by UserName
    getDoctorByUserName: async (req, res) => {
        try {
            const { username } = req.params;
    
            if (!username) {
                return res.status(400).json({ error: 'Username parameter is missing' });
            }
    
            const doctor = await UnifiedDoctor.aggregate([
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
                        'userDetails.userName': username ,
                    }
                }
            ]);
    
            if (doctor.length === 0) {
                return res.status(404).json({ error: 'Doctor not found' });
            }
    
            res.status(200).json(doctor[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // Update user data of Doctor by userName
    updateUserDataOfDoctorByUserName: async (req, res) => {
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

    // Update Doctor details by userName
    updateDoctorDataByUserName: async (req, res) => {
        try {
            const { userName } = req.params;
            const updatedData = req.body;
            await UnifiedDoctor.aggregate([
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
                    $unwind: '$userData'
                },
                {
                    $set: updatedData
                },
                {
                    $project: {
                        userData: 0,
                    }
                },
                {
                    $merge: {
                        into: 'unifieddoctors',
                        whenMatched: 'merge'
                    }
                }
            ]);
    
            return res.status(200).json({ message: 'Doctor Updated Successfully' });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    updateAdminData: async (req, res) => {
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
                    $unwind: '$userData'
                },
                {
                    $set: updatedData
                },
                {
                    $project: {
                        userData: 0,
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
    

    // Delete a doctor by UserName
    deleteDoctorByUsername: async (req, res) => {
        try {
            const { username } = req.params;
            // console.log(username)
            const doctorIDs = await UnifiedDoctor.aggregate([
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
                        'userDetails.userName': username
                    }
                },
                {
                    $project: {
                        _id: 1
                    }
                }
            ]);
    
            if (doctorIDs.length === 0) {
                console.log(`No doctors associated with username ${username}.`);
                return res.status(404).json({ error: 'No doctors found' });
            }
            
            const { _id } = doctorIDs[0];

            const deletionResult = await UnifiedDoctor.deleteOne({ _id });
            const deleteUser = await User.deleteOne({userName: username});
            
            if(deletionResult.deletedCount === 0 && !deleteUser){
                return res.status(404).json({ message: 'Doctor not found'});
            }
            res.status(201).json({ message: 'User and associated Doctor(s) have been deleted' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    
    // Create Hospital
    createHospital: async (req, res) => {
        try {
            const { hospitalId, hospitalName, location, hasAmbulance, ambulances } = req.body;
    
            const existingHospital = await Hospital.findOne({ hospitalId });
    
            if (existingHospital) {
                return res.status(400).json({ error: 'Hospital ID already exists' });
            }
    
            const ambulanceDetails = [];
    
            if (ambulances && Array.isArray(ambulances)) {
                ambulances.forEach(ambulance => {
                    const { plateNumber, model, isAvailable } = ambulance;
                    ambulanceDetails.push({
                        plateNumber,
                        model,
                        isAvailable
                    });
                });
            }
    
            const hospital = new Hospital({
                hospitalId,
                hospitalName,
                location,
                hasAmbulance,
                ambulances: ambulanceDetails
            });
    
            await hospital.save();
    
            res.status(201).json({ message: 'Hospital created successfully', hospital });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    
    // Get hospital by hospitalId and hospitalName
    getHospital: async (req, res) => {
        try {
            const { hospitalId, hospitalName } = req.body;

            if (hospitalId && hospitalName) {
                const hospitals = await Hospital.find({ hospitalId, hospitalName });
                if (hospitals.length === 0) {
                    return res.status(404).json({ error: 'No hospitals found with the provided details' });
                }
                return res.status(200).json(hospitals);
            }

            const query = {};

            if (!hospitalId && !hospitalName) {
                const hospitals = await Hospital.find();
                return res.status(200).json(hospitals);
            }

            if (hospitalId) {
                query.hospitalId = hospitalId;
            }

            if (hospitalName) {
                query.hospitalName = hospitalName;
            }

            const hospital = await Hospital.find(query);
            res.status(200).json(hospital);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // Get all hospitals
    getAllHospital: async (req, res) => {
        try {
            const hospitals = await Hospital.find();
            return res.status(200).json(hospitals);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // Update Hospital by HospitalId
    updateHospitalById: async (req, res) => {
        try {
            const { hospitalId } = req.params;
            const hospitalData = req.body;
            // console.log(hospitalData);
            const hospital = await Hospital.findOneAndUpdate({ "hospitalId": hospitalId }, hospitalData, { new: true });

            if (!hospital) {
                return res.status(404).json({ error: 'Hospital not found' });
            }

            res.status(200).json(hospital);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // Delete a hospital by hospitalId
    deleteHospitalById: async (req, res) => {
        try {
            const { hospitalId } = req.params;
            const hospital = await Hospital.findOneAndDelete({ hospitalId });
    
            if (!hospital) {
                return res.status(404).json({ error: 'Hospital not found' });
            }
    
            res.status(201).json({ message: 'Hospital deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};

module.exports = adminController;
