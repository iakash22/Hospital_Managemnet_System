const Patient = require("../../../models/Patient");

const receptionist_appointment_post = async (req, res) => {
  try {
    // get the patient and record index and update its appointment details
    const { email, index, clinicNumber } = req.body;
    console.log("hello receptionist", index);
    if (!email || !index || !clinicNumber) {
      return res.status(402).json({
        success: false,
        message: "All fileds required"
      });
    }
    Patient.findOne({ email }, function (error, document) {
      if (error) return res.status(400).json({ msg: "Something went wrong" });
      document.medical_records[index].appointment_details.clinicNumber = clinicNumber;
      document.markModified("medical_records");
      document
        .save()
        .then(data => res.json({ msg: "Successfully added clinic number to appointment" }))
        .catch(err => res.status(400).json({ msg: "Something went wrong" }));
    });
  } catch (err) {
    console.log("Error occurred while appoint clinic to patient", err);
    return res.status(505).json({
      success : false,
      message : "Clinic appoint failed,please try after sometimes",
    })
  }
};

module.exports = { receptionist_appointment_post };
