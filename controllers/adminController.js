const UnifiedDoctor = require("../models/unifiedDoctorSchema");
const Hospital = require("../models/hospitalSchema");

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
            const { userName } = req.params;
            const doctor = await UnifiedDoctor.findOne({ 'user.userName': userName }).populate('user');
    
            if (!doctor) {
                return res.status(404).json({ error: 'Doctor not found' });
            }
            console.log(doctor.user.email);
            res.status(200).json(doctor);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // Get hospital by hospitalId and hospitalName
    getHospital: async (req, res) => {
        try {
            const { hospitalId, hospitalName } = req.query;
            const query = {};

            if (hospitalId) query.hospitalId = hospitalId;
            if (hospitalName) query.hospitalName = hospitalName;

            const hospital = await Hospital.find(query);
            res.status(200).json(hospital);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Update a doctor by UserName
    updateDoctorByUsername: async (req, res) => {
        try {
            const { username } = req.params;
            const doctor = await UnifiedDoctor.findOneAndUpdate({ "user.userName": username }, req.body, { new: true });

            if (!doctor) {
                return res.status(404).json({ error: "Doctor not found" });
            }

            res.status(200).json(doctor);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Delete a doctor by UserName
    deleteDoctorByUsername: async (req, res) => {
        try {
            const { username } = req.params;
            const doctor = await UnifiedDoctor.findOneAndDelete({ 'user.userName': username });
    
            if (!doctor) {
                return res.status(404).json({ error: 'Doctor not found' });
            }
    
            res.status(204).json();
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
            const hospital = await Hospital.findByIdAndUpdate({"hospitalId" : hospitalId} , req.body , { new: true });
    
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
            const hospital = await Hospital.findByIdAndDelete({"hospitalId" : hospitalId});

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
