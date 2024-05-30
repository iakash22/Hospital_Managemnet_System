const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bp = require("body-parser");
const cors = require("cors");
const dbConnect = require("./config/dbConnect");

require('dotenv').config();

// express app
const app = express();
app.use(cors());

// PORT to run the app on (default = 5000)
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
// logger middleware
app.use(morgan("dev"));

// body parser for url encoded data (form data)
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

// handle patient routes
app.use("/patient", require("./routes/patient/patientRoutes"));

// handle staff routes
app.use("/staff", require("./routes/staff/staffRoutes"));

app.listen(PORT, () => {
  console.log(`Server listen on ${PORT}`);
});
dbConnect();
