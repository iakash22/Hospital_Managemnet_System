const Patient = require("../../../models/Patient");

const cashier_bill_post = (req, res) => {
  // get the patient email and recordId and update its payment details
  try {
    const { email, index, total, issue_date, due_date, tax_rate, bill_items, generated_by } = req.body;
    if (!email || !index || !total || !issue_date || !due_date || !tax_rate || !bill_items) {
      return res.status(402).json({
        success: false,
        message : "All fields required",
      })
    }
    const newPaymentDetails = { total, issue_date, due_date, tax_rate, bill_items, generated_by };

    Patient.findOne({ email }, function (error, document) {
      console.log(document);
      if (error) return res.status(400).json({ msg: "Something went wrong", error });
      console.log(document.medical_records[index]);
      document.medical_records[index].payment_details = newPaymentDetails;
      document.markModified("medical_records");
      document
        .save()
        .then(data => res.json({ msg: "Successfully added payment details" }))
        .catch(err => res.status(400).json({ msg: "Something went wrong",error : err }));
    });
  } catch (err) {
    console.log('Error occurrecd while cashier', err);
    return res.status(501).json({
      success: false,
      message: "Server failure",
      error : err.message
    })
  }
};

module.exports = { cashier_bill_post };
