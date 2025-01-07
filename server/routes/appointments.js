const express = require('express');
const db = require("../db/connection.js");
const { ObjectId } = require("mongodb");
const router = express.Router();

const isValidObjectId = (id) => {
    return ObjectId.isValid(id) && (new ObjectId(id)).toString() === id;
  };

/**
 * @swagger
 * /appointments/{patientId}:
 *   get:
 *     summary: Retrieve detailed appointments for a specific patient
 *     tags: [Appointments]
 *     parameters:
 *       - name: patientId
 *         in: path
 *         required: true
 *         description: The ID of the patient
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of matching appointments with detailed information
 *       400:
 *         description: Invalid patient ID provided
 *       404:
 *         description: No appointments found
 */
router.get("/:patientId", async (req, res) => {
    const { patientId } = req.params;
  
    if (!patientId || typeof patientId !== "string") {
      return res.status(400).send({ message: "Invalid patient ID" });
    }
  
    try {
      let collection = await db.collection("doctors");
  
      const doctors = await collection.find({ "appointments.patientId": patientId }).toArray();
  
      if (!doctors || doctors.length === 0) {
        return res.status(404).send({ message: "No appointments found" });
      }
  
      // Extract detailed appointments
      const patientAppointments = doctors.flatMap((doctor) =>
        doctor.appointments
          .filter((appointment) => appointment.patientId === patientId)
          .map((appointment) => ({
            appointmentDate: appointment.appointmentDate,
            appointmentTime: appointment.appointmentTime,
            department: doctor.dept_name,
            doctorName: doctor.name,
          }))
      );
  
      if (patientAppointments.length === 0) {
        return res.status(404).send({ message: "No appointments found" });
      }
  
      res.status(200).send({
        message: "Appointments retrieved successfully",
        appointments: patientAppointments,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Error retrieving appointments" });
    }
  });

  module.exports=router;