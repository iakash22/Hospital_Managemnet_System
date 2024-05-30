import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

// axios
import api from "../../../../api/axios";

// hooks
import { useAuthContext } from "./../../../../hooks/useAuthContext";

export default function Doctor() {
  const { user } = useAuthContext();
  const [records, setRecords] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [renderForm, setRenderForm] = useState(false);
  const [doctorComments, setDoctorComments] = useState("");
  const [index, setIndex] = useState(null);

  const handlePatientSearch = async e => {
    e.preventDefault();
    try {
      const response = await api.get(`/staff/history/${encodeURIComponent(searchEmail)}`).then(userData => {
        // console.log(userData);
        setRecords(userData?.data?.patient?.medical_records);
        // console.log(records);
      });
    } catch (err) {
      console.log(`Error : ${err.message}`);
    }
  };

  const handlePrescriptionSubmit = async e => {
    e.preventDefault();
    const date = new Date(Date.now());
    try {
      const data = { index, doctor_comments: doctorComments, date, email: searchEmail, given_by: user.name };
      const response = await api.post("/staff/doctor", data).then(userData => {
        setRenderForm(false);
        setDoctorComments("");
      });
    } catch (err) {
      console.log(`Error : ${err.message}`);
    }
  };

  const handleEdit = e => {
    setIndex(e.target.value);
    setDoctorComments("");
    setRenderForm(true);
  };

  return (
    <Grid item xs={12} md={12} lg={12}>
      <Paper
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          height: "auto",
        }}
      >
        <h2 className="dashboard-title">Doctor Portal</h2>
        <Box component="form" onSubmit={handlePatientSearch} sx={{ mt: 2, mb: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="searchEmail"
            label="Patient Email Address"
            name="searchEmail"
            autoComplete="searchEmail"
            autoFocus
            onChange={e => setSearchEmail(e.target.value)}
            value={searchEmail}
          />

          <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
            Search
          </Button>
        </Box>
        {renderForm && (
          <Box component="form" onSubmit={handlePrescriptionSubmit} sx={{ mt: 2, mb: 2 }}>
            <TextField
              id="outlined-multiline-flexible"
              label="Doctor Comments"
              fullWidth
              multiline
              value={doctorComments}
              onChange={e => setDoctorComments(e.target.value)}
              helperText="Add additional comments for the prescription"
              maxRows={5}
              required
              sx={{ mb: 2, mt: 2 }}
            />

            <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
              Update Prescription
            </Button>
          </Box>
        )}
        {records && (
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Record Id</TableCell>
                  <TableCell align="center">Date</TableCell>
                  <TableCell align="center">Doctor Comments</TableCell>
                  <TableCell align="center">Given By</TableCell>
                  <TableCell align="center">Medicines</TableCell>
                  <TableCell align="center">Edit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record, index) => (
                  <TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell align="center">{record._id}</TableCell>
                    <TableCell align="center">
                      {record.prescription.date
                        ? new Date(record.prescription.date).toDateString()
                        : new Date(Date.now()).toDateString()}
                    </TableCell>
                    <TableCell align="center">{record.prescription.doctor_comments}</TableCell>
                    <TableCell align="center">{record.prescription.given_by}</TableCell>
                    <TableCell align="center">
                      {record.prescription.medicines.map(medicine => medicine.name + ", ")}
                    </TableCell>
                    <TableCell align="center">
                      <Button onClick={handleEdit} name="edit" value={index}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Grid>
  );
}
