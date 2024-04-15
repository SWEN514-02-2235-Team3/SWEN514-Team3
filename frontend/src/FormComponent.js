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
  Tooltip,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { signIn, signUp, getCurrentUser, signOut } from "aws-amplify/auth";
import MenuIcon from "@mui/icons-material/Menu";
import WordCloudComponent from "./WordCloudComponent";
import BarChartComponent from "./BarChartComponent";
import CloseIcon from "@mui/icons-material/Close";
import PieChartComponent from "./PieChartComponent";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import LineChartComponent from "./LineChartComponent";
// import PopularWordsChart from "./PopularWordsChart";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00b0ff", // Primary
    },
    secondary: {
      main: "#f50057", // Pink for username
    },
  },
});

function testRegex(inputString) {
  // Define the regex pattern as described
  const pattern = /[\w+]+/g; // This seems to be the pattern you were given, but it might be intended to be /[\w]+/g

  // Find all matches for the pattern
  const matches = inputString.match(pattern);
  console.log("Matches found:", matches);

  // Test if the entire string matches the pattern
  const fullMatch = pattern.test(inputString);
  console.log("Does the entire string match the pattern? ", fullMatch);

  // Highlighting parts of the string that do not match
  // Reconstruct the string with non-matching parts highlighted
  let lastIndex = 0;
  let resultString = "";

  if (matches) {
    matches.forEach((match) => {
      const startIndex = inputString.indexOf(match, lastIndex);
      const endIndex = startIndex + match.length;

      // Append the part of the string before the match (non-matching part)
      resultString +=
        inputString.substring(lastIndex, startIndex) + "[Non-Match Start]";
      // Append the match
      resultString += match + "[Match End]";
      // Update the lastIndex to be the end of the current match
      lastIndex = endIndex;
    });

    // Append any remaining part of the string after the last match
    if (lastIndex < inputString.length) {
      resultString +=
        "[Non-Match Start]" +
        inputString.substring(lastIndex) +
        "[Non-Match End]";
    }
  } else {
    // No matches found, the entire string is a non-match
    resultString = "[Non-Match Start]" + inputString + "[Non-Match End]";
  }

  console.log(
    "Reconstructed string with non-matching parts highlighted: ",
    resultString
  );
}

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
    console.log(process.env.REACT_APP_COGNITO_CLIENT_ID); // Log to verify the exact value being used
    console.log(process.env.REACT_APP_COGNITO_USER_POOL_ID); // Log to verify the exact value being used

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
        const { isSignedIn, nextStep } = await signIn({ username, password });
        setUser(await getCurrentUser());
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
      setPlatforms(""); // Reset the platform state to empty, which will uncheck all radio buttons
      setAnalysisData(null);
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
  const [analyzedPlatform, setAnalyzedPlatform] = useState({
    platform: null,
    num_comments: 0,
  });
  const [analyzeError, setAnalyzeError] = useState(null);

  // Default limit number
  const [limit, setLimit] = useState(null);

  //sidebar toggler
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Handler to toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handler when the user clicks "Analyze"
  const handleAnalyze = async () => {
    // Function to fetch data goes here...
    setIsFirstLoad(false); // Exit fullscreen mode after analysis
  };

  // START LIVE DATASETS VARIABLES
  const [liveLimit, setLiveLimit] = useState(1);
  const [liveStatus, setLiveStatus] = useState("");
  // END LIVE DATASETS VARIABLES

  const [platform, setPlatforms] = useState("");

  const [dateRange, setDateRange] = useState({
    // TODO - Grey out dates that are not available to input
    start: dayjs("2020-10-01"), // default start: October 1, 2020
    end: dayjs(), // default end: November 30, 2023
  });

  const setDatesDefault = () => {
    setDateRange({
      start: dayjs("2020-10-01"), // October 1, 2020
      end: dayjs(), // November 30, 2023
    });
  };

  const removeDates = () => {
    const today = dayjs();
    setDateRange({
      start: null,
      end: today,
    });
  };

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
    setAnalyzeError("");

    // Put dates in yyyy-mm-dd format
    const start = new Date(dateRange.start);
    const formattedStartDate = `${start.getFullYear()}-${(start.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${start.getDate().toString().padStart(2, "0")}`;
    const end = new Date(dateRange.end);
    const formattedEndDate = `${end.getFullYear()}-${(end.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${end.getDate().toString().padStart(2, "0")}`;

    // Define query string parameters
    const queryParams = new URLSearchParams({
      limit: limit,
      platform: platform,
      date_range_from: formattedStartDate,
      date_range_to: formattedEndDate,
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
        setAnalyzedPlatform(platform);
        setAnalyzedPlatform({
          platform: platform,
          num_comments: data.length,
        });
      })

      .catch((error) => {
        console.error("Error fetching data:", error);
        setAnalyzeError(`Error fetching data: ${error}`);
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
        let statusString = <Box></Box>;
        // Construct the status string
        if (!comments_analyzed) {
          statusString = (
            <Box>
              <Typography>
                Could not find any comments across {videos_found} videos.
              </Typography>
              {videos_analyzed == 0 && videos_found > 0 && (
                <Typography>
                  This is because {videos_found} have already been analyzed.
                </Typography>
              )}
              <Typography>Retry again to generate more datasets.</Typography>
            </Box>
          );
        } else {
          statusString = (
            <Box>
              <Typography>
                Generated {comments_analyzed} sentiments (comments) from{" "}
                {videos_analyzed} video(s).
                {
                  // TODO: Should paste youtube IDs of videos that has been generated alongside their comments
                }
              </Typography>
              {videos_analyzed != videos_found && (
                <Typography>
                  {videos_found - videos_analyzed} of which has been ignored
                  since sentiments have already been generated.
                </Typography>
              )}
              <Typography>Retry again to generate more datasets.</Typography>
            </Box>
          );
        }
        // Set the status string
        setLiveStatus(statusString);
      })

      .catch((error) => {
        console.error(error);
        setLiveStatus("Data sets have been generated");
        // setLiveStatus(error.message || "Error occurred while fetching data.");
      })

      .finally(() => {
        setLiveDatasetsLoading(0);
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar
        position="static"
        color="secondary"
        style={{ backgroundColor: "#00b0ff" }}
      >
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
            COVID-19 Sentiment Analysis
          </Typography>
          {user ? (
            <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "left" }}>
              <Typography variant="h6" component="span" sx={{ mr: 1 }}>
                Welcome
              </Typography>
              {/* Different style for username */}
              <Typography variant="h6" component="span" color="secondary">
                {user.username}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ flexGrow: 1 }} /> // This keeps the Sign In/Up button aligned to the right
          )}
          {user ? (
            <Button color="inherit" onClick={signOutApp}>
              Sign Out
            </Button>
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
              <FormLabel>
                Choose a platform
                <Tooltip
                  placement="right"
                  title={
                    <Typography variant="body1">
                      Choose a platform to analyze sentiments from a dataset or
                      live source. This is a required.
                    </Typography>
                  }
                >
                  <IconButton>
                    <HelpOutlineIcon />
                  </IconButton>
                </Tooltip>
              </FormLabel>
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
                  control={<Radio disabled={!user} />}
                  label={
                    <Tooltip
                      title={
                        user
                          ? "YouTube (Live Datasets)"
                          : "Only available to authenticated users"
                      }
                    >
                      <span>YouTube (Live Datasets)</span>
                    </Tooltip>
                  }
                />
                {platform == "youtube_live" && (
                  <Box>
                    <Typography variant="h6">
                      YouTube Live Datasets Options
                      <Tooltip
                        placement="right"
                        title={
                          <Typography variant="body1">
                            You'll be able to generate sentiments from the
                            YouTube API here. Once datasets are generated,
                            you'll be able to analyze it in a separate request.
                          </Typography>
                        }
                      >
                        <IconButton>
                          <HelpOutlineIcon />
                        </IconButton>
                      </Tooltip>
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
                    <Tooltip
                      sx={{ mt: 2.5 }}
                      placement="right"
                      title={
                        <Typography variant="body1">
                          Select the number of videos you want to dynamically
                          generate sentiments. You can only generate sentiments
                          up to 10 videos at a time.
                        </Typography>
                      }
                    >
                      <IconButton>
                        <HelpOutlineIcon />
                      </IconButton>
                    </Tooltip>
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
              <FormLabel>
                Choose a date range
                <Tooltip
                  placement="right"
                  title={
                    <Typography variant="body1">
                      You can filter the sentiments by a date range. The data is
                      displayed from the most recent comments to the oldest.
                    </Typography>
                  }
                >
                  <IconButton>
                    <HelpOutlineIcon />
                  </IconButton>
                </Tooltip>
              </FormLabel>
              <Box sx={{ my: "20px" }}></Box>
              <DatePicker
                label="Start Date"
                disabled={!platform}
                value={dateRange.start}
                onChange={(newValue) => {
                  handleDateChange("start", newValue);
                }}
                renderInput={(params) => <TextField {...params} />}
                sx={{ width: "170px" }}
              />
              <DatePicker
                label="End Date"
                disabled={!platform}
                value={dateRange.end}
                onChange={(newValue) => {
                  handleDateChange("end", newValue);
                }}
                renderInput={(params) => <TextField {...params} />}
                sx={{ width: "170px" }}
              />
            </LocalizationProvider>
            <Button
              variant="contained"
              color="primary"
              disabled={!platform}
              onClick={() => removeDates()}
              sx={{ mt: 1, mx: 1 }}
            >
              <span>Clear</span>
            </Button>
            <Box />
            <Button
              variant="contained"
              color="primary"
              disabled={!platform}
              onClick={() => setDatesDefault()}
              sx={{ mt: 2 }}
            >
              <span>Reset to Default Dates</span>
            </Button>
          </Box>
          <Divider sx={{ my: "20px" }} />
          <Box>
            <FormLabel component="legend">
              Choose a number of datapoints
              <Tooltip
                placement="right"
                title={
                  <Typography variant="body1">
                    You can filter how many datapoints are shown on the
                    visualizations. If none is provided then it will display all
                    datapoints.
                  </Typography>
                }
              >
                <IconButton>
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
            </FormLabel>
            <TextField
              label="Limit"
              type="number"
              disabled={!platform}
              variant="outlined"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              margin="normal"
              sx={{ width: "170px" }}
            />
            <Button
              variant="contained"
              color="primary"
              disabled={!platform}
              onClick={() => setLimit("")}
              sx={{ mt: 3, mx: 1 }}
            >
              <span>Clear</span>
            </Button>
          </Box>
          <Divider sx={{ my: "20px" }} />
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={get_sentiments}
              disabled={!platform}
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
            <Typography>{analyzeError}</Typography>
          </Box>
        </Grid>
        <Grid id="visualizations" item xs={7}>
          {analysisData && (
            <Box>
              <Typography sx={{ mt: 4 }} variant="h3">
                Sentiments for {analyzedPlatform.platform} (
                {analyzedPlatform.num_comments} comments)
              </Typography>
              <Divider sx={{ my: "20px" }} />
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
