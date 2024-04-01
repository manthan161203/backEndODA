const { response } = require("express");
const mongoose = require("mongoose");
const Appointments = require("../models/appointmentSchema");
const Patient = require("../models/patientSchema");
const UnifiedDoctor = require("../models/unifiedDoctorSchema");
const User = require("../models/userSchema");
const sendOTPViaEmail = require("../services/otpNodeMailer");
const moment = require("moment");
const Appointment = require("../models/appointmentSchema");
const Hospital = require("../models/hospitalSchema");
const sendEmailNotification = async (emailData) => {
  try {
    // const toEmail = emailData.email;
    const toEmail = "tirthprajapati26@gmail.com";
    const subject = "Appointment Status Update";
    var htmlTemplate;
    var text;
    if (emailData.status == "Accepted") {
      text = "Appointment is Accepted";
      htmlTemplate = `<!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Appointment Accepted</title>
        </head>
        
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 50px;">
                <tr>
                    <td>
                        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"
                            style="margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="margin-top: 0; color: #333333;">Appointment Accepted</h2>
                                    <!-- Replace placeholders with dynamic data -->
                                    <p style="margin-bottom: 20px; color: #666666;">Dear ${
                                      emailData.PatientName
                                    },</p>
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                                        <tr>
                                            <td style="vertical-align: top;">
                                                <p style="margin-bottom: 20px; color: #666666;"><strong>Doctor:</strong> ${
                                                  emailData.DoctorName
                                                }</p>
                                                <p style="margin-bottom: 20px; color: #666666;"><strong>Date:</strong> ${
                                                  emailData.date
                                                }</p>
                                                <p style="margin-bottom: 20px; color: #666666;"><strong>Time:</strong> ${
                                                  emailData.time
                                                }</p>
                                                <p style="margin-bottom: 20px; color: #666666;"><strong>Location:</strong> ${
                                                  emailData.location
                                                }</p>
                                                <p style="margin-bottom: 20px; color: #666666;"><strong>Prerequisite:</strong> ${
                                                  emailData.prerequisite ??
                                                  "No Prerequisite"
                                                }</p>
                                                <p style="margin-bottom: 20px; color: #666666;"><strong>Notes:</strong> ${
                                                  emailData.notes ?? "No Notes"
                                                }</p>
                                            </td>
                                            <td style="vertical-align: top; padding-right: 20px;">
                                                <img src="http://easy-health-care.infinityfreeapp.com/appointmentAccepted.png" alt="Doctor Image" width="150" style="border-radius: 8px;">
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="margin-bottom: 20px; color: #666666;">Your appointment request has been accepted.</p>
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
    } else if (emailData.status == "Rejected") {
      htmlTemplate = `<!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Appointment Rejected</title>
        </head>
        
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 50px;">
                <tr>
                    <td>
                        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"
                            style="margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="margin-top: 0; color: #333333;">Appointment Rejected</h2>
                                    <!-- Replace placeholders with dynamic data -->
                                    <p style="margin-bottom: 20px; color: #666666;">Dear ${emailData.PatientName},</p>
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                                        <tr>
                                            <td style="vertical-align: top;">
                                                <p style="margin-bottom: 20px; color: #666666;"><strong>Doctor:</strong> ${emailData.DoctorName}</p>
                                                <p style="margin-bottom: 20px; color: #666666;"><strong>Date:</strong> ${emailData.date}</p>
                                                <p style="margin-bottom: 20px; color: #666666;"><strong>Time:</strong> ${emailData.time}</p>
                                                <p style="margin-bottom: 20px; color: #666666;"><strong>Location:</strong> ${emailData.location??"location is not provided"}</p>
                                                <p style="margin-bottom: 20px; color: #666666;"><strong>Reason:</strong> Doctor Is Busy</p>
                                            </td>
                                            <td style="vertical-align: top; padding-right: 20px;">
                                                <img src="http://easy-health-care.infinityfreeapp.com/appointmentRejected.png" alt="Doctor Image" width="150" style="border-radius: 8px;">
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="margin-bottom: 20px; color: #666666;">Your appointment request has been rejected.</p>
                                    <p style="margin-bottom: 20px; color: #666666;">Please contact us for further information.</p>
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
    } else if (emailData.status == "Recommended") {
      htmlTemplate = `<!DOCTYPE html>
      <html lang="en">
      
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Status</title>
      </head>
      
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
              style="margin-top: 50px;">
              <tr>
                  <td>
                      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"
                          style="margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                          <tr>
                              <td style="padding: 40px;">
                                  <h2 style="margin-top: 0; color: #333333;">Appointment Status</h2>
                                  <!-- Replace placeholders with dynamic data -->
                                  <p style="margin-bottom: 20px; color: #666666;">Dear ${emailData.PatientName},</p>
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0"
                                      style="width: 100%;">
                                      <tr>
                                          <td style="vertical-align: top;">
                                              <p style="margin-bottom: 20px; color: #666666;"><strong>Doctor:</strong>
                                                  ${emailData.DoctorName}</p>
                                              <p style="margin-bottom: 20px; color: #666666;"><strong>Date:</strong>
                                                  ${emailData.date}</p>
                                                 
                                              <p style="margin-bottom: 20px; color: #666666;"><strong> Recommended Doctor Name:</strong>
                                                  ${emailData.recommendedDoctorName}</p>
                                              <p style="margin-bottom: 20px; color: #666666;"><strong>Recommended Hospital Location:</strong>
                                                  ${emailData.location}</p>
                                              <p style="margin-bottom: 20px; color: #666666;"><strong>Status:</strong>
                                                  ${emailData.status}</p>
                                          </td>
                                          <td style="vertical-align: top; padding-right: 20px;">
                                              <img src="http://easy-health-care.infinityfreeapp.com/appointmentRecommend.png"
                                                  alt="Doctor Image" width="150" style="border-radius: 8px;">
                                          </td>
                                      </tr>
                                  </table>
                                  <p style="margin-bottom: 20px; color: #666666;">${emailData.DoctorName} is not available on ${emailData.date} please consult recommended doctor</p>
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
    }

    // Use your existing email sending service
    await sendOTPViaEmail(toEmail, subject, text, htmlTemplate);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Failed to send email");
  }
};

const unifiedDoctorController = {
  getAppointmentsByDoctorID: async (req, res) => {
    try {
      const doctorId = await UnifiedDoctor.findOne(
        { user: req.params.doctorID },
        { doctor: true }
      );
      console.log(doctorId);
      const appointments = await Appointments.find({ doctor: doctorId._id,status:{$in:["Pending","Active","Accepted"]} })
        .sort({ date: 1 })
        .populate({ path: "patient", populate: "user" })
        .populate({ path: "doctor", populate: "user" })
        .exec();
      console.log(appointments);
      res.status(200).json(appointments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getAllAppointments: async (req, res) => {
    try {
      const appointments = await Appointment.find({});
      res.status(200).json(appointments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getActiveAppointmentsByDoctorID: async (req, res) => {
    try {
      const doctorId = await UnifiedDoctor.findOne(
        { user: req.params.doctorID },
        { doctor: true }
      );
      console.log(doctorId);
      const appointments = await Appointments.find({
        doctor: doctorId._id,
        status: "Active",
      })
        .populate({ path: "patient", populate: "user" })
        .populate({ path: "doctor", populate: "user" })
        .exec();
      console.log(appointments);
      if (appointments.length == 0) {
        res.status(200).json(0);
      } else {
        res.status(200).json(appointments);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getAppointmentsHistoryByDoctorID: async (req, res) => {
    try {
      const doctorId = await UnifiedDoctor.findOne(
        { user: req.params.doctorID },
        { doctor: true }
      );
      console.log(doctorId);
      const appointments = await Appointments.find({ doctor: doctorId._id })
        .populate({ path: "doctor", populate: "user" })
        .populate({ path: "patient", populate: "user" })
        .exec();
      console.log(appointments);
      if (appointments.length == 0) {
        res.status(200).json(0);
      } else {
        res.status(200).json(appointments);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getUpComingAppointmentsByDoctorID: async (req, res) => {
    try {
      const doctorId = await UnifiedDoctor.findOne(
        { user: req.params.doctorID },
        { doctor: true }
      );
      console.log(doctorId);
      const appointments = await Appointments.find({
        doctor: doctorId._id,
        status: "Accepted",
      })
        .populate({ path: "doctor", populate: "user" })
        .populate({ path: "patient", populate: "user" })
        .exec();
      const upcomingAppointments = appointments.filter((app) => {
        if (moment().isBefore(moment(appointments.date))) {
          return app;
        }
      });
      const sortedAppointments = upcomingAppointments.sort(
        (a, b) =>
          new moment(a.date).format("YYYYMMDD") -
          new moment(b.date).format("YYYYMMDD")
      );
      console.log(sortedAppointments);
      res.status(200).json(sortedAppointments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getTodayAppointmentsByDoctorID: async (req, res) => {
    try {
      const doctorId = await UnifiedDoctor.findOne(
        { user: req.params.doctorID },
        { doctor: true }
      );
      console.log(doctorId);
      const appointments = await Appointments.find({
        doctor: doctorId._id,
        status: "Accepted",
      })
        .sort({ date: 1 })
        .populate({ path: "patient", populate: "user" })
        .exec();
      const todayAppointments = appointments.filter((app) => {
        if (moment().isSame(moment(appointments.date))) {
          return app;
        }
      });
      res.status(200).json(todayAppointments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getPendingAppointmentsByDoctorID: async (req, res) => {
    try {
      const doctorId = await UnifiedDoctor.findOne(
        { user: req.params.doctorID },
        { _id: true }
      );
      console.log(doctorId);
      const appointments = await Appointments.find({
        doctor: doctorId._id,
        status: "Pending",
      })
        .populate({ path: "patient", populate: "user" })
        .exec()
        .sort({ date: -1 });
      const expAppointments = appointments.filter((app) => {
        if (!moment().isSame(moment(app.date))) {
          if (moment().isAfter(moment(app.date))) {
            return app;
          }
        }
      });
      const pendingAppointmnets = appointments.filter((app) => {
        if (moment().isBefore(moment(app.date))) {
          return app;
        }
      });

      for (const appointment of expAppointments) {
        await Appointments.findByIdAndUpdate(appointment._id, {
          status: "Rejected",
        });
      }
      console.log(pendingAppointmnets);
      res.status(200).json(pendingAppointmnets);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getUpComingAppointmentsCount: async (req, res) => {
    try {
      const doctorId = await UnifiedDoctor.findOne(
        { user: req.params.doctorID },
        { doctor: true }
      );
      // console.log(doctorId)
      const appointments = await Appointments.find({
        doctor: doctorId._id,
        status: "Accepted",
      })
        .populate({ path: "patient", populate: "user" })
        .sort({ date: -1 })
        .exec();
      // console.log(appointments)
      const upcomingAppointments = appointments.filter((app) => {
        if (moment().isBefore(moment(app.date))) {
          return app;
        }
      });
      // console.log(upcomingAppointments);
      res.status(200).json(upcomingAppointments.length ?? 0);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getTodayAppointmentsCount: async (req, res) => {
    try {
      const doctorId = await UnifiedDoctor.findOne(
        { user: req.params.doctorID },
        { doctor: true }
      );
      const appointments = await Appointments.find({
        doctor: doctorId._id,
        status: "Accepted",
      })
        .populate({ path: "patient", populate: "user" })
        .exec();
      const todayAppointments = appointments.filter((app) => {
        if (moment().isSame(moment(app.date))) {
          return app;
        }
      });
      // console.log(todayAppointments)
      res.status(200).json(todayAppointments.length ?? 0);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getPendingAppointmentsCount: async (req, res) => {
    try {
      const doctorId = await UnifiedDoctor.findOne(
        { user: req.params.doctorID },
        { doctor: true }
      );
      const appointments = await Appointments.find({
        doctor: doctorId._id,
        status: "Pending",
      })
        .populate({ path: "patient", populate: "user" })
        .exec();
      const expAppointments = appointments.filter((app) => {
        if (!moment().isSame(moment(app.date))) {
          if (moment().isAfter(moment(app.date))) {
            return app;
          }
        }
      });
      const pendingAppointmnets = appointments.filter((app) => {
        if (moment().isBefore(moment(app.date))) {
          console.log(app.date);
          return app;
        }
      });

      for (const appointment of expAppointments) {
        await Appointments.findByIdAndUpdate(appointment._id, {
          status: "Rejected",
        });
      }
      // console.log(pendingAppointmnets);
      res.status(200).json(pendingAppointmnets.length ?? 0);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  // Update Appointment Status
  acceptAppointment: async (req, res) => {
    try {
      const { appointmentID } = req.params;
      const appointment = await Appointments.findByIdAndUpdate(
        appointmentID,
        {
          $set: {
            status: "Accepted",
            prerequisite: req.body.prerequisite,
            notes: req.body.notes,
          },
        },
        { new: true }
      )
        .populate({ path: "patient", populate: "user" })
        .exec();
      console.log(appointment);
      const doctor = await UnifiedDoctor.findById(appointment.doctor);
      const doctorData = await User.findById(doctor.user);
      const hospitalData = await Hospital.findById(doctor.hospitalID);
      const emailData = {};
      emailData.PatientName =
        appointment.patient.user.firstName +
        " " +
        appointment.patient.user.lastName;
      emailData.DoctorName = doctorData.firstName + " " + doctorData.lastName;
      emailData.time =
        appointment.slot.startTime + " " + appointment.slot.endTime;
      emailData.date = appointment.date;
      emailData.location = hospitalData.location;
      emailData.prerequisite = req.body.prerequisite;
      emailData.notes = req.body.notes;
      emailData.email = appointment.patient.user.email;
      emailData.status = "Accepted";

      await sendEmailNotification(emailData);
      // res.status(200).json({ message: 'Appointment status updated successfully' });
      res.status(200).json(appointment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  updateAppointmentStatus: async (req, res) => {
    try {
      const { appointmentID } = req.params;
      const data = req.body;
      const updatedAppointment = await Appointments.findOneAndUpdate(
        { appointmentId: appointmentID },
        { $set: data },
        { new: true }
      )
        .populate({ path: "patient", populate: "user" })
        .exec();

      await sendEmailNotification(updatedAppointment);
      // res.status(200).json({ message: 'Appointment status updated successfully' });
      res.status(200).json(updatedAppointment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Get Patient Info
  getPatientInfo: async (req, res) => {
    try {
      const { patientID } = req.params;
      // console.log(patientID);
      const patientData = await Patient.findById(patientID).populate("user");
      res.status(200).json(patientData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  recommendDoctor: async (req, res) => {
    try {
      const { appointmentID,doctorID } = req.params;
      console.log(req.params)
      console.log(doctorID)
      const appointment = await Appointments.findByIdAndUpdate(
        appointmentID,
        {
          $set: {
            status: "Recommended",
          },
        },
        { new: true }
      )
        .populate({ path: "patient", populate: "user" })
        .exec();
      console.log(appointment);
      const doctor = await UnifiedDoctor.findById(appointment.doctor);
      const recommendedDoctor = await UnifiedDoctor.findById(appointment.recommendedDoctors[0]);
      const doctorData = await User.findById(doctor.user);
      const recommendedDoctorData = await User.findById(recommendedDoctor.user);
      const recommendedhospitalData = await Hospital.findById(recommendedDoctor.hospitalID);
      // console.log(recommendedhospitalData)
      const hospitalData = await Hospital.findById(doctor.hospitalID);
      const emailData = {};
      emailData.PatientName =
        appointment.patient.user.firstName +
        " " +
        appointment.patient.user.lastName;
      emailData.DoctorName = doctorData.firstName + " " + doctorData.lastName;
      emailData.recommendedDoctorName = recommendedDoctorData.firstName + " " + recommendedDoctorData.lastName;
      emailData.date = appointment.date;
      if(recommendedhospitalData)
      emailData.location = recommendedhospitalData.location;
      emailData.email = appointment.patient.user.email;
      emailData.status = "Recommended";
      await sendEmailNotification(emailData);
      res.status(200).json(appointment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  startAppointment: async (req, res) => {
    try {
      const { appointmentID } = req.params;
      const appointment = await Appointment.findByIdAndUpdate(appointmentID,{$set: {status:"Active"}}); 
      res.status(200).json(appointment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  completeAppointment: async (req, res) => {
    try {
      const { appointmentID } = req.params;
      const appointment = await Appointment.findByIdAndUpdate(appointmentID,{$set: {status:"Completed"}}); 
      res.status(200).json(appointment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  createDoctor: async (req, res) => {
    try {
      // console.log("Hii");
      const doctorData = req.body;
      const userId = doctorData.user;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
      }

      let userObjectId;
      try {
        userObjectId = mongoose.Types.ObjectId.createFromHexString(userId);
        // console.log(doctorData);
      } catch (error) {
        return res.status(400).json({ message: "Invalid User ID format." });
      }

      doctorData.user = userObjectId;
      if (doctorData.doctorType === "doctor") {
        const hospitalId = doctorData.hospitalID;
        if (hospitalId) {
          doctorData.hospitalID =
            mongoose.Types.ObjectId.createFromHexString(hospitalId);
        } else {
          return res
            .status(400)
            .json({ message: "Hospital ID is required for Doctor type." });
        }
      }
      const createdDoctor = await UnifiedDoctor.create(doctorData);
      await User.updateOne({ _id: userObjectId }, { $set: { isSubProfileSet: true } });
      return res
        .status(200)
        .json({
          message: "Doctor Created Successfully",
          doctor: createdDoctor,
        });
    } catch (error) {
      console.error("Error creating doctor:", error.message);
      return res
        .status(500)
        .json({ message: "Error creating doctor", error: error.message });
    }
  },

  // Get Role Based Details
  getRoleBasedDetails: async (req, res) => {
    try {
      const { userName } = req.params;
      // console.log(userName);

      const data = await UnifiedDoctor.aggregate([
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

  // Get Doctors by Specialization
  getDoctorBySpecialization: async (req, res) => {
    try {
      const { specialization } = req.params;
      // console.log(specialization);
      const doctors = await UnifiedDoctor.find({
        doctorSpecialization: specialization,
      }).populate("user");
      res.status(200).json(doctors);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Get Doctors by Type
  getDoctorByType: async (req, res) => {
    try {
      const { doctorType } = req.params;
      // console.log(specialization);
      const doctors = await UnifiedDoctor.find({
        doctorType: doctorType,
      }).populate(["user", "hospitalID"]);
      res.status(200).json(doctors);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Get All Doctors
  getAllDoctors: async (req, res) => {
    try {
      const doctors = await UnifiedDoctor.find().populate("user");
      res.status(200).json(doctors);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Get Doctors by Hospital
  getDoctorByHospital: async (req, res) => {
    try {
      const { hospitalName } = req.params;
      // console.log(hospitalName);
      const doctors = await UnifiedDoctor.aggregate([
        {
          $lookup: {
            from: "hospitals",
            localField: "hospitalID",
            foreignField: "_id",
            as: "hospitalData",
          },
        },
        {
          $match: {
            "hospitalData.hospitalName": hospitalName,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
      ]);
      res.status(200).json(doctors);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = unifiedDoctorController;
