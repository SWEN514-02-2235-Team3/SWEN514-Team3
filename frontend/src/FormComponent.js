import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  createTheme,
  ThemeProvider,
  IconButton,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
} from "@mui/material";
import WordCloudComponent from "./WordCloudComponent";
import BarChartComponent from "./BarChartComponent";
import PieChartComponent from "./PieChartComponent";
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
  const totalSteps = 3;

  // state display to handle which chart to show
  const [displayMode, setDisplayMode] = useState("form");

  // data received from API
  const [analysisData, setAnalysisData] = useState(null);

  // Default limit number
  const [limit, setLimit] = useState(5);

  const [platform, setPlatforms] = useState("");

  const [dateRange, setDateRange] = useState({
    // Random boundaries for now
    // TODO - Grey out dates that are not available to input
    start: dayjs("2020-10-01"), // October 1, 2020
    end: dayjs("2023-11-30"), // November 30, 2023
  });

  const [loading, setLoading] = useState(0);

  const handlePlatformChange = (event) => {
    setPlatforms(event.target.value);
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prevStep) => prevStep + 1);
    }
  };

  const handleReturn = () => {
    setAnalysisData(null);
    setDisplayMode("form");
    setStep(1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prevStep) => prevStep - 1);
    }
  };

  const handleDateChange = (name, value) => {
    setDateRange({ ...dateRange, [name]: value });
  };

  const get_sentiments = async () => {
    const invokeURL = process.env.REACT_APP_API_URL; // for local development this is available on the frontend/.env file from deploying terraform infra; available as environment variable for amplify
    setLoading(1);
    // Define query string parameters
    const queryParams = new URLSearchParams({
      limit: limit,
      source: platform,
    });

    // Construct the full URL with query string parameters
    const urlWithParams = `${invokeURL}/sentiments?${queryParams.toString()}`;

    // Define the headers
    // Headers do not work atm

    // Use fetch to make the GET request
    fetch(urlWithParams, {
      method: "GET",
    })
      .then((response) => response.json())

      .then((data) => {
        setAnalysisData(data);
        setDisplayMode("wordCloud");
        console.log(data);
      })

      .catch((error) => {
        console.error("Error fetching data:", error);
      })

      .finally(() => {
        setLoading(0);
      });
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
          <Typography component="h1" variant="h3" color="primary" gutterBottom>
            Sentiment Analysis
          </Typography>
          {displayMode === "form" && (
            <>
              {step === 1 && (
                <FormControl component="fieldset">
                  <FormLabel component="legend">Choose your platform</FormLabel>
                  <RadioGroup
                    aria-label="platform"
                    name="platform"
                    value={platform}
                    onChange={handlePlatformChange}
                  >
                    <FormControlLabel
                      value="youtube"
                      control={<Radio />}
                      label="YouTube"
                    />
                    <FormControlLabel
                      value="reddit"
                      control={<Radio />}
                      label="Reddit"
                    />
                    <FormControlLabel
                      value="twitter"
                      control={<Radio />}
                      label="Twitter"
                    />
                  </RadioGroup>
                </FormControl>
              )}
              {step === 2 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    mt: 2,
                  }}
                >
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
              {step === 3 && (
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <FormLabel component="legend">
                    Choose a number of datapoints
                  </FormLabel>
                  <TextField
                    label="Limit"
                    type="number"
                    variant="outlined"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    margin="normal"
                  />
                </Box>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  mt: 2,
                }}
              >
                {step > 1 ? (
                  <IconButton onClick={handleBack} color="primary">
                    <ArrowBackIcon />
                  </IconButton>
                ) : (
                  // This empty div acts as a placeholder to keep the "next" button aligned to the right
                  <div />
                )}
                {/* Empty div here to maintain spacing if necessary */}
                <div style={{ flexGrow: 1 }} />
                {step < totalSteps ? (
                  <IconButton onClick={handleNext} color="primary">
                    <ArrowForwardIcon />
                  </IconButton>
                ) : (
                  // Empty div for allignment
                  <div />
                )}
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={get_sentiments}
                fullWidth
                sx={{ mt: 2 }}
              >
                {loading ? (
                  <CircularProgress
                    size={25}
                    sx={{ color: "white" }}
                    thickness={5}
                  />
                ) : (
                  <span>Analyze</span>
                )}
              </Button>
            </>
          )}
          {displayMode === "wordCloud" && analysisData && (
            <WordCloudComponent data={analysisData} />
          )}
          {displayMode === "barChart" && analysisData && (
            <BarChartComponent data={analysisData} />
          )}
          {displayMode === "pieChart" && analysisData && (
            <PieChartComponent data={analysisData} />
          )}
          {analysisData && (
            <Box>
              <Button onClick={() => setDisplayMode("wordCloud")}>
                Word Cloud
              </Button>
              <Button onClick={() => setDisplayMode("barChart")}>
                Bar Chart
              </Button>
              <Button onClick={() => setDisplayMode("pieChart")}>
                Pie Chart
              </Button>
              <Button onClick={handleReturn}>Return</Button>
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};
export default FormComponent;
