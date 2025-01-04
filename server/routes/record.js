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
    
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving record");
  }
});

module.exports = router;
