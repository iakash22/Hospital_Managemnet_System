const Patient = require("../../models/Patient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// controller to register a patient
const patient_register = async (req, res) => {
  try {
    const { name, email, password, age, gender, address, dob, phone } = req.body;
    // console.log(req.body);

    if (!name || !email || !password || !age || !gender || !address || !dob || !phone) {
      return res.status(401).json({
        success: false,
        message: "All fields are required"
      })
    }

    // check if the email is already registered
    // await Patient.findOne({ email }).then(patient => {
    //   if (patient) return res.status(409).json({ msg: "Email already registered" });

    const userExist = await Patient.findOne({ email });

    if (userExist) {
      return res.status(402).json({
        success: false,
        msg: "Email already registered"
      })
    }

    // else create new instance of patient for registration
    // const newPatient = new Patient({
    //   name,
    //   email,
    //   password,
    //   age,
    //   gender,
    //   address,
    //   dob,
    //   phone,
    //   medical_records: [],
    // });


    /* create salt and hash*/
    const hashPassword = await bcrypt.hash(password, 10);

    const userData = await Patient.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      address,
      dob,
      phone,
      medical_records: [],
    });

    return res.status(201).json({
      success: true,
      message: "User register successfully",
      userData,
    });

    //   bcrypt.genSalt(10, async (err, salt) => {
    //     await bcrypt.hash(newPatient.password, salt, async (err, hash) => {
    //       if (err) return res.status(400).json({ msg: "Invalid data received" });

    //       newPatient.password = hash;

    // register the patient and return the data as response
    //       await newPatient.save().then(patient => {
    //         jwt.sign({ id: patient.id }, 'Akash', { expiresIn: 3600 }, (err, token) => {
    //           if (err) throw err;

    //           res.json({
    //             token,
    //             user: {
    //               id: patient.id,
    //               name: patient.name,
    //               email: patient.email,
    //               isStaff: false,
    //             },
    //           });
    //         });
    //       });
    //     });
    //   });
    // });
  } catch (err) {
    console.log("Error occurred while register user", err);
    return res.status(404).json({
      success: false,
      message: "User cannot be registered, please try again later"
    });
  }
}

// controller to authenticate and log in a patient
const patient_login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "All fields are required"
      })
    }

    // check if the email is already registered
    // Patient.findOne({ email }).then(patient => {
    //   if (!patient) return res.status(409).json({ msg: "patient does not exist" });

    const user = await Patient.findOne({ email });

    console.log(user)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "patient does not exist",
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: email,
        id: user._id,
        role: "",
      }

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 36000 });

      user.token = token;
      user.password = undefined;

      const options = {
        expire: new Date(Date.now + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      return res.cookie("token", token, options).status(201).json({
        success: true,
        message: "User login successfull",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isStaff: false,
        },
        data: user,
      })
    } else {
      return res.status(402).json({
        success: false,
        message: "Password incorrect",
      });
    }

    // validate password sent by the client
    //   bcrypt.compare(password, patient.password).then(isMatch => {
    //     if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // generate token and send payload with token as a response back
    //     jwt.sign({ id: patient.id }, 'Akash', { expiresIn: 3600 }, (err, token) => {
    //       if (err) throw err;

    //       res.json({
    //         token,
    //         user: {
    //           id: patient.id,
    //           name: patient.name,
    //           email: patient.email,
    //           isStaff: false,
    //         },
    //       });
    //     });
    //   });
    // });
  } catch (err) {
    console.log("error occurred while login", err);
    // Return 500 Internal Server Error status code with error message
    return res.status(500).json({
      success: false,
      message: "User login failure, please try again",
    });
  }
};

// patient_appointment_post, patient_appointment_get, patient_record_get

const patient_appointment_post = async (req, res) => {
  try {
    // create an appointment for patient
    const { id, date, description } = req.body;
    const newRecord = { appointment_details: { date, description } };

    if (!id || !date || !description) {
      return res.status(401).json({
        success: false,
        message: "All fields are required"
      })
    }
    // console.log(newRecord);

    const appointmentData = await Patient.findByIdAndUpdate(
      id,
      {
        $push: {
          medical_records: newRecord,
        }
      },
      { new: true }
    );

    // Patient.findByIdAndUpdate(id, { $push: { medical_records: newRecord } }, (error, success) =>
    //   error ? res.status(400).json({ msg: "Something went wrong" }) : res.json({ msg: "Appointment booked successfully" })
    // );

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      // data: appointmentData.,
    });
  } catch (err) {
    console.log("error occurred while patient appointment", err);
    res.status(500).json({
      success: false,
      message: "Patient Apointment failure, please try again",
    })
  }
}

const patient_index = async (req, res) => {
  try {
    // get patient data
    const { id } = req.body;
    console.log("patient index");
    if (!id) {
      return res.status(402).json({
        success: false,
        message: "Patient id missing"
      })
    }

    // return the patient's data except for the password

    // Patient.findById(id)
    //   .select("password")
    //   .then(patient => res.json(patient));

    const data = await Patient.findById(id).select("-password").exec();

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Patient id invalid"
      })
    }

    return res.status(201).json({
      success: true,
      message: "Patient data fetched",
      patient: data
    });
  } catch (err) {
    console.log("error occurred while fetching patient data", err);
    return res.status(501).json({
      success: false,
      message: "Patient data fetch failure, please try again",
    })
  }
}

const patient_history_get = async (req, res) => {
  // get patient data
  try {
    console.log("patient history");
    const id = req.params.id;
    // return the patient's data except for the password
    if (!id) {
      return res.status(402).json({
        success: false,
        message: "Patient id missing"
      });
    }
    // Patient.findById(id)
    //   .select("medical_records -_id")
    //   .then(patient => res.json(patient));
    const data = await Patient.findById(id).select("medical_records -_id").exec();
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Patient id invalid"
      })
    }

    return res.status(201).json({
      success: true,
      message: "Patient medical records fetched",
      patient: data,
    })
  } catch (err) {
    console.log("error occurred while get patient medical record", err);
    return res.status(501).json({
      success: false,
      message: "Patient medical records fetch failure, please try some time later",
    })
  }
};

// exporting the controllers
module.exports = {
  patient_register,
  patient_login,
  patient_appointment_post,
  patient_index,
  patient_history_get,
};
