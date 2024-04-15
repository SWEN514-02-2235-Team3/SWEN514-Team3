import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  createTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import MenuIcon from "@mui/icons-material/Menu";
import { signIn, signUp, getCurrentUser, signOut } from "aws-amplify/auth";
import CloseIcon from "@mui/icons-material/Close";
import WordCloudComponent from "./WordCloudComponent";
import BarChartComponent from "./BarChartComponent";
import PieChartComponent from "./PieChartComponent";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import LineChartComponent from "./LineChartComponent";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00b0ff",
    },
  },
});

const FormComponent = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin"); // 'signin' or 'signup'
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser(); // Check for current user on component mount
  }, []);

  const checkUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Not signed in", error);
      setUser(null);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === "signin" ? "signup" : "signin");
  };

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  const handleAuthAction = async (event) => {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;

    try {
      if (authMode === "signup") {
        await signUp({
          username,
          password,
        });
        alert("Sign up successful!");
      } else {
        console.log(`Username: ${username}, Password ${password}`);
        const { isSignedIn, nextStep } = await signIn({ username, password });
        setUser(getCurrentUser());

        console.log("Sign in successful: ", user);
        alert("Sign in successful!");
      }
    } catch (error) {
      alert("Error: " + error);
    }

    handleModalClose();
  };

  const signOutApp = async () => {
    try {
      await signOut();
      setUser(null);
      alert("Signed out successfully!");
    } catch (error) {
      console.error("Error signing out: ", error);
      alert("Failed to sign out!");
    }
  };
  // const [step, setStep] = useState(1);
  // const totalSteps = 3;

  // // state display to handle which chart to show
  // const [displayMode, setDisplayMode] = useState("form");

  // data received from API
  const [analysisData, setAnalysisData] = useState(null);

  // Default limit number
  const [limit, setLimit] = useState(5);

  // START LIVE DATASETS VARIABLES
  const [liveLimit, setLiveLimit] = useState(1);
  const [liveStatus, setLiveStatus] = useState(
    "Waiting for datasets to be generated..."
  );
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

  // const handleNext = () => {
  //   if (step < totalSteps) {
  //     setStep((prevStep) => prevStep + 1);
  //   }
  // };

  // const handleReturn = () => {
  //   setAnalysisData(null);
  //   setDisplayMode("form");
  //   setStep(1);
  // };

  // const handleBack = () => {
  //   if (step > 1) {
  //     setStep((prevStep) => prevStep - 1);
  //   }
  // };

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
        console.log(data);
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
        const statusString = "";
        // Construct the status string
        if (!comments_analyzed) {
          statusString = `Could not find any comments across ${videos_analyzed} analyzed videos (${videos_found} total found). Retry again to generate more datasets.`;
        } else {
          statusString = `Generated ${comments_analyzed} sentiments (comments) from ${videos_analyzed} videos (${videos_found} total found).`;
        }
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
          {user ? (
            <>
              <Typography variant="h6" component="div" sx={{ marginRight: 2 }}>
                Welcome {user.username}
              </Typography>
              <Button color="inherit" onClick={signOutApp}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={handleModalOpen}>
              Sign In / Sign Up
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Dialog open={isModalOpen} onClose={handleModalClose}>
        <DialogTitle>
          {authMode === "signin" ? "Sign In" : "Sign Up"}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleModalClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500], //to gray out the screen while the modal shows up
          }}
        >
          <CloseIcon />
        </IconButton>
        <form onSubmit={handleAuthAction}>
          <DialogContent>
            <TextField
              margin="dense"
              id="username"
              label="Username"
              type="text"
              fullWidth
              variant="standard"
              required
            />
            <TextField
              margin="dense"
              id="password"
              label="Password"
              type="password"
              fullWidth
              variant="standard"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button type="submit">
              {authMode === "signin" ? "Sign In" : "Sign Up"}
            </Button>
            <Button onClick={toggleAuthMode}>
              {authMode === "signin"
                ? "Need an account? Sign Up"
                : "Already have an account? Sign In"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Grid container direction="row" spacing={11} justifyContent="flex-start">
        <Grid id="formSelectOptions" item m={3}>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            Analysis Options
          </Typography>
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
                {platform == "youtube_live" && (
                  <Box>
                    <Typography variant="h6">
                      YouTube Live Datasets Options{" "}
                    </Typography>
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
                    <Box />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={generate_live_datasets}
                      fullWidth
                      sx={{ mt: 2, width: "200px" }}
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
                )}
              </RadioGroup>
            </FormControl>
          </Box>
          <Divider sx={{ my: "20px" }} />
          <Box>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <FormLabel>Choose a date range</FormLabel>
              <Box sx={{ my: "20px" }}></Box>
              <DatePicker
                label="Start Date"
                value={dateRange.start}
                onChange={(newValue) => {
                  handleDateChange("start", newValue);
                }}
                renderInput={(params) => <TextField {...params} />}
                sx={{ width: "170px" }}
              />
              <DatePicker
                label="End Date"
                value={dateRange.end}
                onChange={(newValue) => {
                  handleDateChange("end", newValue);
                }}
                renderInput={(params) => <TextField {...params} />}
                sx={{ width: "170px" }}
              />
            </LocalizationProvider>
          </Box>
          <Divider sx={{ my: "20px" }} />
          <Box>
            <FormLabel component="legend">
              Choose a number of datapoints{" "}
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
              sx={{ width: "170px" }}
            />
          </Box>
          <Divider sx={{ my: "20px" }} />
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
          {analysisData && (
            <Box>
              <BarChartComponent data={analysisData} />
              <LineChartComponent data={analysisData} />
              <PieChartComponent data={analysisData} />
              <WordCloudComponent data={analysisData} />
            </Box>
          )}
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};
export default FormComponent;
