const Staff = require("../../models/Staff");
const Patient = require("../../models/Patient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();

// controller to authenticate and log in a staff member
const staff_login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "All fields are required"
      })
    }

    // check if the email is already registered
    // Staff.findOne({ email }).then(staff => {
    //   if (!staff) return res.status(409).json({ msg: "staff member does not exist" });
    const user = await Staff.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "staff does not exist",
      });
    }

    // validate password sent by the client
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: email,
        id: user._id,
        role: user.job_title,
      };
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
          jobTitle: user.job_title,
          isStaff: true,
        },
        data: user,
      })
    } else {
      return res.status(402).json({
        success: false,
        message: "Password incorrect",
      });
    }
    //   bcrypt.compare(password, staff.password).then(isMatch => {
    //     if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // generate token and send payload with token as a response back
    //     jwt.sign({ id: staff.id }, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
    //       if (err) throw err;

    //       res.json({
    //         token,
    //         user: {
    //           id: staff.id,
    //           name: staff.name,
    //           email: staff.email,
    //           jobTitle: staff.job_title,
    //           isStaff: true,
    //         },
    //       });
    //     });
    //   });
    // });
  } catch (err) {
    console.log("error occurred while staff login", err);
    return res.status(501).json({
      success: false,
      message: "User login failure, please try again",
    })
  }
}

// controller to register a staff member
const staff_register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      age,
      gender,
      address,
      dob,
      phone,
      joining_date,
      education,
      department,
      job_title } = req.body;

    if (!name || !email || !password || !age || !gender || !address || !phone ||
      !joining_date || !education || !department || !job_title) {
      return res.status(401).json({
        success: false,
        message: "All fields are required"
      })
    }

    // check if the email is already registered
    // Staff.findOne({ email }).then(staff => {
    //   if (staff) return res.status(409).json({ msg: "Email already registered" });

    const userExist = await Patient.findOne({ email });
    if (userExist) {
      return res.status(402).json({
        success: false,
        msg: "Email already registered"
      })
    }

    // else create new instance of staff for registration
    // const newStaff = new Staff({
    //   name,
    //   email,
    //   password,
    //   age,
    //   gender,
    //   address,
    //   dob,
    //   phone,
    //   joining_date,
    //   education,
    //   department,
    //   job_title,
    // });

    /* create hash */
    const hashPassword = await bcrypt.hash(password, 10);
    const userData = await Staff.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      address,
      dob,
      phone,
      joining_date,
      education,
      department,
      job_title,
    });

    return res.status(201).json({
      success: true,
      message: "User register successfully",
      userData,
    });

    // create salt and hash
    //   bcrypt.genSalt(10, (err, salt) => {
    //     bcrypt.hash(newStaff.password, salt, (err, hash) => {
    //       if (err) return res.status(400).json({ msg: "Invalid data received" });

    //       newStaff.password = hash;

    // register the staff and return the data as response
    //       newStaff.save().then(staff => {
    //         jwt.sign({ id: staff.id }, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
    //           if (err) throw err;

    //           res.json({
    //             token,
    //             user: {
    //               id: staff.id,
    //               name: staff.name,
    //               email: staff.email,
    //               jobTitle: staff.job_title,
    //               isStaff: true,
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
};

const staff_history_get = async (req, res) => {
  try {
    // get the patient email and return its data
    const email = req.params.email;

    // return the patient's data except for the password
    const data = await Patient.findOne({ email }).select("medical_records -_id").exec();

    /* Patient.findOne({ email })
      .select("medical_records -_id")
      .then(patient => res.json(patient));
    */

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Patient data not found"
      });
    }

    return res.status(201).json({
      success: true,
      message: "Patient data fetch successfull",
      patient: data,
    });
  } catch (err) {
    console.log("error occurred while get staff history record", err);
    return res.status(501).json({
      success: false,
      message: "Staff history fetch failure, please try some time later",
    })
  }
};

const staff_index = async (req, res) => {
  try {
    // get staff member data
    const { id } = req.body;

    if (!id) {
      return res.status(402).json({
        success: false,
        message: "Patient id missing"
      })
    }

    // Staff.findById(id)
    //   .select("-password")
    //   .then(staff => res.json(staff));
    
    const data = await Staff.findById(id).select("-password").exec();

    if (!data) {
      return res.status(404).json({
        success: false,
        message : "Staff id invalid"
      })
    }
    // return the user's data except for the password
    return res.status(201).json({
      success: true,
      message: "Staff data fetched",
      staff : data
    });
  } catch (err) {
    console.log("error occurred while fetching staff data", err);
    return res.status(501).json({
      success: false,
      message: "Staff data fetch failure, please try again",
    })
  }
};

module.exports = { staff_login, staff_register, staff_history_get, staff_index };
