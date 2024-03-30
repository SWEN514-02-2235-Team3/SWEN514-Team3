import React, { useState } from "react";
import {
  Container,
  Typography,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  createTheme,
  ThemeProvider,
  IconButton,
  TextField,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00b0ff",
    },
  },
});

const FormComponent = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 3; // Updated total steps

  const [platforms, setPlatforms] = useState({
    youtube: false,
    reddit: false,
    twitter: false,
  });

  const [dateRange, setDateRange] = useState({
    start: dayjs("2020-10-01"), // October 1, 2020
    end: dayjs("2023-11-30"), // November 30, 2023
  });

  const handlePlatformChange = (event) => {
    setPlatforms({ ...platforms, [event.target.name]: event.target.checked });
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prevStep) => prevStep - 1);
    }
  };

  const handleDateChange = (name, value) => {
    setDateRange({ ...dateRange, [name]: value });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Container component="main" maxWidth="sm" sx={{ p: 3 }}>
          <Typography component="h1" variant="h5" color="primary" gutterBottom>
            <h1>Sentiment Analysis</h1>
          </Typography>
          {step === 1 && (
            <FormControl component="fieldset" variant="standard" fullWidth>
              <FormGroup>
                <h2>Choose your platform(s)</h2>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={platforms.youtube}
                      onChange={handlePlatformChange}
                      name="youtube"
                    />
                  }
                  label="YouTube"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={platforms.reddit}
                      onChange={handlePlatformChange}
                      name="reddit"
                    />
                  }
                  label="Reddit"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={platforms.twitter}
                      onChange={handlePlatformChange}
                      name="twitter"
                    />
                  }
                  label="Twitter"
                />
              </FormGroup>
            </FormControl>
          )}

          {step === 2 && (
            <Box>
              <h2>Pick a start and end date for data</h2>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.start}
                  onChange={(newValue) => {
                    handleDateChange("start", newValue);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
                <DatePicker
                  label="End Date"
                  value={dateRange.end}
                  onChange={(newValue) => {
                    handleDateChange("end", newValue);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </Box>
          )}
          {/* Placeholder for additional form steps based on `step` variable */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              mt: 2,
            }}
          >
            {step > 1 && (
              <IconButton onClick={handleBack} color="primary">
                <ArrowBackIcon />
              </IconButton>
            )}
            {step === 1 && <div />} {}
            {step < totalSteps && (
              <IconButton onClick={handleNext} color="primary">
                <ArrowForwardIcon />
              </IconButton>
            )}
            {step === totalSteps && <div />} {}
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              alert("Hello World");
            }}
            fullWidth
            sx={{ mt: 2 }}
          >
            Analyze
          </Button>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default FormComponent;
