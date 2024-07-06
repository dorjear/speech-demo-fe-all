import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Tabs, Tab, Box, Typography } from '@mui/material';
import TextToSpeech from "./speech/TextToSpeech";
import SpeechToTextNoServer from "./speech/SpeechToTextNoServer";
import SpeechToTextTokenFromServer from "./speech/SpeechToTextTokenFromServer";
import SpeechToTextThroughServer from "./speech/SpeechToTextThroughServer";

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

const App = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Router>
      <div>
        <AppBar position="static">
          <Tabs value={value} onChange={handleChange} aria-label="simple tabs example" sx={{ backgroundColor: 'orange' }} TabIndicatorProps={{
            style: {
              backgroundColor: '#fff',
            },
          }}>
            <Tab label="TTS" component={Link} to="/" />
            <Tab label="STT no server" component={Link} to="/sttNoServer" />
            <Tab label="STT token from server" component={Link} to="/sttTokenFromServer" />
            <Tab label="STT through server" component={Link} to="/sttThroughServer" />
          </Tabs>
        </AppBar>
        <Routes>
          <Route path="/" element={<TextToSpeech />} />
          <Route path="/sttNoServer" element={<SpeechToTextNoServer />} />
          <Route path="/sttTokenFromServer" element={<SpeechToTextTokenFromServer />} />
          <Route path="/sttThroughServer" element={<SpeechToTextThroughServer />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
