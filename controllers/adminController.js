const UnifiedDoctor = require("../models/unifiedDoctorSchema");
const Hospital = require("../models/hospitalSchema");
const User = require("../models/userSchema");

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
            console.log(query);
    
            const doctors = await UnifiedDoctor.find(query).populate('user');
            res.status(200).json(doctors);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get doctors by hospitalID
    getDoctorsByHospitalID : async (req, res) => {
        try {
            const { hospitalID } = req.body;
    
            const hospital = await Hospital.findOne({ hospitalId: hospitalID });
                
            if (!hospital) {
                return res.status(404).json({ error: 'Hospital not found' });
            }
    
            const doctors = await UnifiedDoctor.find({ hospitalID: hospital._id }).populate('user').populate('hospitalID');
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
                        $and: [
                            { 'userDetails.userName': username },
                            { 'user': { $ne: null } } // Ensures doctor has associated user
                        ]
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

    // Update Doctor by UserName
    updateDoctorByUsername: async (req, res) => {
        try {
            const { userName } = req.params;
            const updatedUserData = req.body.updatedUserData;
            const updatedDoctorData = req.body.updatedDoctorData;

            // Find the doctor by username and update the data
            const doctor = await UnifiedDoctor.findOneAndUpdate(
                { 'user.userName': userName },
                updatedDoctorData,
                { new: true }
            ).populate('user');

            console.log(doctor);
            if (!doctor) {
                return res.status(404).json({ error: 'Doctor not found' });
            }

            const updatedUser = await User.findOneAndUpdate(
                { userName: userName },
                updatedUserData,
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json(doctor);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // Delete a doctor by UserName
    deleteDoctorByUsername: async (req, res) => {
        try {
            const { username } = req.body; // Extract the username from the request body
    
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
                        $or: [
                            { 'userDetails.userName': username },
                            { 'admin.userName': username }
                        ]
                    }
                }
            ]);
    
            if (doctor.length === 0) {
                console.log(`Doctor or User with username ${username} not found.`);
                return res.status(404).json({ error: 'Doctor or User not found' });
            }
    
            const userIDsToDelete = doctor.map(doc => doc.user); // Assuming 'user' is the user reference field in UnifiedDoctor
    
            // Delete the corresponding doctor(s) from UnifiedDoctor schema
            await UnifiedDoctor.deleteMany({ user: { $in: userIDsToDelete } });
    
            res.status(204).json({ message: 'Doctor(s) and associated User(s) have been deleted' });
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

    // Update Hospital by HospitalId
    updateHospitalById: async (req, res) => {
        try {
            const { hospitalId } = req.params;
            const hospital = await Hospital.findByIdAndUpdate({ "hospitalId": hospitalId }, req.body, { new: true });

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
