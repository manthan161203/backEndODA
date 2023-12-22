const UnifiedDoctor = require("../models/unifiedDoctorSchema");
const Hospital = require("../models/hospitalSchema");
const User = require("../models/userSchema");

const adminController = {
    // Get doctors by type, specialization, and hospitalId
    getDoctors: async (req, res) => {
        try {
            const { doctorType, specialization, hospitalId } = req.body;
            const query = {};

            if (doctorType) query.doctorType = doctorType;
            if (specialization) query.doctorSpecialization = specialization;
            if (hospitalId) query.hospitalId = hospitalId;

            const doctors = await UnifiedDoctor.find(query).populate('user');
            res.status(200).json(doctors);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get Doctor by UserName
    getDoctorByUserName: async (req, res) => {
        try {
            const { userName } = req.body; // Destructure userName from req.params
    
            if (!userName) {
                return res.status(400).json({ error: 'Username parameter is missing' });
            }
    
            // Use findOne to find a doctor by userName
            const doctor = await UnifiedDoctor.findOne({ 'user.userName': userName });
    
            if (!doctor) {
                return res.status(404).json({ error: 'Doctor not found' });
            }
            
            res.status(200).json(doctor);
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
    deleteDoctorByUsername : async (req, res) => {
        try {
            const userName = req.body.username; // Extract the username from the request body
            
            const doctor = await UnifiedDoctor.findOne({ 'admin.userName' : userName }).populate('admin').exec();
            console.log(doctor);

            // Delete the corresponding doctor from UnifiedDoctor schema
            const deletedDoctor = await UnifiedDoctor.findOneAndDelete({ 'user.userName': userName }).populate('user');
        
            if (!deletedDoctor) {
                console.log(`Doctor or User with username ${userName} not found.`);
                return res.status(404).json({ error: 'Doctor or User not found' });
            }
        
            res.status(204).json({ message: 'Doctor and User have been deleted' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    
    

    // Create Hospital
    createHospital: async (req, res) => {
        try {
            const hospital = new Hospital(req.body);
            await hospital.save();
            res.status(201).json(hospital);
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
            const hospital = await Hospital.findByIdAndDelete({ "hospitalId": hospitalId });

            if (!hospital) {
                return res.status(404).json({ error: 'Hospital not found' });
            }

            res.status(204).json();
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};

module.exports = adminController;
