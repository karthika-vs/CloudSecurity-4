const express = require('express');
const db = require("../db/connection.js");
const { ObjectId } = require("mongodb");
const router = express.Router();

const isValidObjectId = (id) => {
  return ObjectId.isValid(id) && (new ObjectId(id)).toString() === id;
};

// routes/record.js

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: API for managing patients
 */

/**
 * @swagger
 * /record:
 *   get:
 *     summary: Retrieve all patients
 *     tags: [Patients]
 *     responses:
 *       200:
 *         description: A list of patients
 *       500:
 *         description: Error retrieving records
 */


// Get all records
router.get("/", async (req, res) => {
  try {
    let collection = await db.collection("patients");
    let results = await collection.find({}).toArray();
    res.status(200).send(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving records");
  }
});

/**
 * @swagger
 * /record/{id}:
 *   get:
 *     summary: Retrieve a patient by UHID
 *     tags: [Patients]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The UHID of the patient
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single patient record
 *       400:
 *         description: Invalid UHID provided
 *       404:
 *         description: Record not found
 */
// Get a single record by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (typeof id !== 'string') { 
    return res.status(400).send({ message: "Invalid UHID" });
  }
  try {
    let collection = await db.collection("patients");
    let query = { UHID: id};
    let result = await collection.findOne(query);

    if (!result) {
      return res.status(404).send({ message: "Record not found" });
    }

    const formattedResult ={
      UHID: result.UHID,
      name: `${result.firstName} ${result.lastName}`,
      age: result.age,
      phoneNumber: result.phoneNumber,
      totalVisits: result.totalAppointments,
    };
    
    res.status(200).send(formattedResult);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving record");
  }
});


// Get appointments for a specific patient
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

// Get detailed appointments for a specific patient
router.get("/appointments/:patientId", async (req, res) => {
  const { patientId } = req.params;

  if (!patientId || typeof patientId !== "string") {
    return res.status(400).send({ message: "Invalid patient ID" });
  }

  try {
    let collection = await db.collection("doctors");

    // Find doctors with appointments for the patientId
    const doctors = await collection
      .find({ "appointments.patientId": patientId })
      .toArray();

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

module.exports = router;