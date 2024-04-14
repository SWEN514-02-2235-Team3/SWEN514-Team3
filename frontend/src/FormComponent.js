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
  AppBar,
  Toolbar,
  Grid,
  Divider,
  Stack,
  useThemeProps,
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
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

  // START LIVE DATASETS VARIABLES
  const [liveLimit, setLiveLimit] = useState(1);
  const [liveStatus, setLiveStatus] = useState("Waiting for datasets to be generated...");
  // END LIVE DATASETS VARIABLES

  const [platform, setPlatforms] = useState("");

  const [dateRange, setDateRange] = useState({
    // Random boundaries for now
    // TODO - Grey out dates that are not available to input
    start: dayjs("2020-10-01"), // October 1, 2020
    end: dayjs("2023-11-30"), // November 30, 2023
  });

  const [loading, setLoading] = useState(0);
  const [liveDatasetsLoading, setLiveDatasetsLoading] = useState(0);

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
      })

      .catch((error) => {
        console.error("Error fetching data:", error);
      })

      .finally(() => {
        setLoading(0);
      });
  };

  const generate_live_datasets = async () => {
    const invokeURL = process.env.REACT_APP_API_URL; // for local development this is available on the frontend/.env file from deploying terraform infra; available as environment variable for amplify
    setLiveDatasetsLoading(1);
    // Define query string parameters
    const queryParams = new URLSearchParams({
      max_results: liveLimit,
      // date_from: "2020-01-01",
      // date_to: "2024-04-13"
    });

    // Construct the full URL with query string parameters
    const urlWithParams = `${invokeURL}/sentiments?${queryParams.toString()}`;

    // Define the headers
    // Headers do not work atm

    // Use fetch to make the POST request
    fetch(urlWithParams, {
      method: "POST",
    })
      .then((response) => response.json())

      .then((data) => {
          // Parse the response object
          const { videos_found, videos_analyzed, comments_analyzed } = data;

          // Construct the status string
          const statusString = `Generated ${comments_analyzed} sentiments (comments) from ${videos_analyzed} videos.`;
          console.log(data);
          // Set the status string
          setLiveStatus(statusString);

      })

      .catch((error) => {
        setLiveStatus(error.message || "Error occurred while fetching data.");
      })

      .finally(() => {
        setLiveDatasetsLoading(0);
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sentiment Analysis
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
      <Grid container direction="row" spacing={11} justifyContent="flex-start">
      <Grid id="formSelectOptions" item m={3}>
        <Typography variant="h4"  sx={{ flexGrow: 1 }}>Analysis Options</Typography>
      <Box>
      <FormControl component="fieldset">
              <FormLabel>Choose your platform</FormLabel>
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
                <FormControlLabel
                  value="youtube_live"
                  control={<Radio />}
                  label="YouTube (Live Datasets)"
                />
                {platform == 'youtube_live' && 
                  <Box>
                    <Typography variant="h6">YouTube Live Datasets Options </Typography>
                    <TextField
                        label="Videos to Analyze (Max 10)"
                        type="number"
                        variant="outlined"
                        value={liveLimit}
                        onChange={(e) => setLiveLimit(e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        margin="normal"
                      />
                      <Box/>
                      <Button
                            variant="contained"
                            color="primary"
                            onClick={generate_live_datasets}
                            fullWidth
                            sx={{ mt: 2, width: '200px', }}
                          >
                            {liveDatasetsLoading ? (
                              <CircularProgress
                                size={25}
                                sx={{ color: "white" }}
                                thickness={5}
                              />
                            ) : (
                              <span>Generate Datasets</span>
                            )}
                          </Button>
                          <Box sx={{ height: 10 }} />
                          <Typography>{liveStatus}</Typography>
                  </Box>
                }
              </RadioGroup>
            </FormControl>
      </Box>
      <Divider sx={{ my: '20px' }} />
      <Box>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
                <FormLabel>Choose a date range</FormLabel>
                <Box  sx={{ my: '20px' }}></Box>
                <DatePicker
                  label="Start Date"
                  value={dateRange.start}
                  onChange={(newValue) => {
                    handleDateChange("start", newValue);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                  sx={{ width: '170px' }}
                />
                <DatePicker
                  label="End Date"
                  value={dateRange.end}
                  onChange={(newValue) => {
                    handleDateChange("end", newValue);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                  sx={{ width: '170px' }}
                />
              </LocalizationProvider>
      </Box>
      <Divider sx={{ my: '20px' }} />
      <Box>
      <FormLabel component="legend">Choose a number of datapoints </FormLabel>
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
          sx={{ width: '170px' }}
        />
      </Box>
      <Divider sx={{ my: '20px' }} />
      <Box>
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
      </Box>
      </Grid>
      <Grid id="visualizations" item xs={7}>
          {analysisData && 
              <Box>
                <BarChartComponent data={analysisData} />
                <PieChartComponent data={analysisData} />
                <WordCloudComponent data={analysisData} />
              </Box>
            }
      </Grid>
    </Grid>
    </ThemeProvider>
  );
};
export default FormComponent;
