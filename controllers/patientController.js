const { response } = require("express");
const Appointment = require("../models/appointmentSchema");
const Patient = require("../models/patientSchema");
const User = require("../models/userSchema");
const sendOTPViaEmail = require("../services/otpNodeMailer");
const UnifiedDoctor = require("../models/unifiedDoctorSchema");
const Hospital = require("../models/hospitalSchema");

const sendEmailNotification = async (emailData) => {
  try {
    const subject = "Appointment Status Update";
    const text = `Your appointment request is received and is Pending`;
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Under Review</title>
    </head>
    
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 50px;">
            <tr>
                <td>
                    <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"
                        style="margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <tr>
                            <td style="padding: 40px;">
                                <h2 style="margin-top: 0; color: #333333;">Appointment Under Review</h2>
                                <!-- Replace placeholders with dynamic data -->
                                <p style="margin-bottom: 20px; color: #666666;">Dear ${emailData.PatientName},</p>
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                                    <tr>
                                        <td style="vertical-align: top;">
                                            <p style="margin-bottom: 20px; color: #666666;"><strong>Doctor:</strong> ${emailData.doctorName}</p>
                                            <p style="margin-bottom: 20px; color: #666666;"><strong>Date:</strong> ${emailData.date}</p>
                                            <p style="margin-bottom: 20px; color: #666666;"><strong>Time:</strong> ${emailData.PatientName}</p>
                                            <p style="margin-bottom: 20px; color: #666666;"><strong>Location:</strong> ${emailData.location}</p>
                                        </td>
                                        <td style="vertical-align: top; padding-right: 20px;">
                                            <img src="http://easy-health-care.infinityfreeapp.com/appointmentPending.png" alt="Doctor Image" width="150" style="border-radius: 8px;">
                                        </td>
                                    </tr>
                                </table>
                                <p style="margin-bottom: 20px; color: #666666;">Your appointment request is under review please wait for acknowledgement.</p>
                                <p style="margin-bottom: 20px; color: #666666;">Thank you for choosing us.</p>
                                <p style="margin-bottom: 0; color: #666666;">Best regards,<br>EazyHeathCare Team</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="padding: 20px 0; text-align: center; font-size: 12px; color: #666666;">
                    &copy; 2024 MTM Brothers. All rights reserved.
                </td>
            </tr>
        </table>
    </body>
    
    </html>
    `;
    await sendOTPViaEmail(emailData.email, subject, text,htmlTemplate);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Failed to send email");
  }
};

const patientController = {
  getAppointmentsByPatientID: async (req, res) => {
    try {
      const { userName } = req.params;
      // console.log(userName);
      const appointments = await Appointment.aggregate([
        {
          $lookup: {
            from: "patients",
            localField: "patient",
            foreignField: "_id",
            as: "patientInfo",
          },
        },
        {
          $unwind: "$patientInfo",
        },
        {
          $lookup: {
            from: "users",
            localField: "patientInfo.user",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        {
          $unwind: "$userInfo",
        },
        {
          $match: {
            "userInfo.userName": userName,
          },
        },
        {
          $sort: {
            date: -1,
          },
        },
        {
          $project: {
            _id: 0,
            appointmentId: 1,
            patient: "$patientInfo._id",
            doctor: 1,
            date: 1,
            slot: 1,
            status: 1,
            prerequisite: 1,
            recommendedDoctors: 1,
            notes: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);
      res.status(200).json(appointments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Update user data of Patient by userName
  updateUserDataOfPatientByUserName: async (req, res) => {
    try {
      const { userName } = req.params;
      const updatedData = req.body;
      const updatedUser = await User.findOneAndUpdate(
        { userName: userName },
        { $set: updatedData },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json(updatedUser);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  // Update Patient details by userName
  updatePatientDataByUserName: async (req, res) => {
    try {
      const { userName } = req.params;
      const updatedData = req.body;
      await Patient.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userData",
          },
        },
        {
          $match: {
            "userData.userName": userName,
          },
        },
        {
          $unwind: "$userData",
        },
        {
          $set: updatedData,
        },
        {
          $project: {
            userData: 0,
          },
        },
        {
          $merge: {
            into: "patients",
            whenMatched: "merge",
          },
        },
      ]);

      return res.status(200).json({ message: "Patient Updated Successfully" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },


    createPatient: async (req, res) => {
        try {
            const patientData = req.body;
            // console.log('Received patient data:', patientData);
    
            const userId = patientData.user;
            if (!userId) {
                // console.error('User ID is missing in the request body.');
                return res.status(400).json({ message: 'User ID is required.' });
            }
    
            let userObjectId;
            try {
                userObjectId = mongoose.Types.ObjectId.createFromHexString(userId);
            } catch (error) {
                // console.error('Invalid User ID format:', error.message);
                return res.status(400).json({ message: 'Invalid User ID format.' });
            }
    
            patientData.isSubProfileSet = true;
            
            patientData.user = userObjectId;
            // console.log('Updated patient data:', patientData);
    
            const createdPatient = await Patient.create(patientData);
            // console.log('Patient Created:', createdPatient);
    
            return res.status(200).json({ message: 'Patient Created Successfully', patient: createdPatient });
        } catch (error) {
            console.error('Error creating patient:', error.message);
            return res.status(500).json({ message: 'Error creating patient', error: error.message });
        }
    },
    
  // Book an appointment
  bookAppointment: async (req, res) => {
    try {
      const { emailID } = req.params;
      const appointmentData = req.body;
      const getAppointmentsByDate = await Appointment.find({
        date: appointmentData.date,
        doctor: appointmentData.doctor,
        "slot.startTime": appointmentData.slot.startTime,
      });
      const emailData = {};
      console.log(getAppointmentsByDate);
      if (getAppointmentsByDate.length == 0) {
        appointmentData.appointmentId = Date.now() * 2;
        const appointment = await Appointment.create(appointmentData);
        if (appointment) {
          const userData = await User.findOne({"email":emailID});
          const doctor = await UnifiedDoctor.findById(appointmentData.doctor);
          const doctorDetails = await User.findById(doctor.user);
          if(doctor.doctorType === "doctor"){
            const hospital = await Hospital.findById(doctor.hospitalID);
            emailData.location = hospital.location;
          }
          console.log(doctor)
          emailData.email = emailID;
          emailData.PatientName = userData.firstName+" "+userData.lastName;
          emailData.doctorName = doctorDetails.firstName+" "+doctorDetails.lastName;
          emailData.date = appointmentData.date;
          emailData.time = appointmentData.slot.startTime+" - "+appointmentData.slot.endTime;;

          sendEmailNotification(emailData);
          res.status(200).json({ message: "Appointment request is received" });
        } else {
          res.status(201).json({ message: "Failed", code: "1" });
        }
      } else {
        return res.status(201).json({ message: "Failed", code: "2" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Get Role Based Details
  getRoleBasedDetails: async (req, res) => {
    try {
      const { userName } = req.params;
      // console.log(userName);

      const data = await Patient.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $match: {
            "user.userName": userName,
          },
        },
        {
          $unwind: "$user",
        },
        {
          $limit: 1,
        },
      ]);
      res.status(200).send(data);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  },
};

module.exports = patientController;
