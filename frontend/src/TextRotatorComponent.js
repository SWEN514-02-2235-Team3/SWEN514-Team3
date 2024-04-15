import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import TextRotator from 'react-text-rotator';

const TextRotatorComponent = ({ data }) => {
  // Define the content for the rotator, extracting comments and setting animation parameters
  const [content, setContent] = useState([]);

  useEffect(() => {
    const rotatorContent = data.map(comment => ({
      text: comment.comment,  // Assuming `comment` is the field where the text is stored
      animation: 'fade',
      color: 'black',
    }));
    setContent(rotatorContent);
  }, [data]);

  // Rotator settings
  const settings = {
    animation: "fade", // Animation type
    separator: ",",
    interval: 3000,  // Interval time in ms
    color: "black",  // Default text color
    backgroundColor: "transparent",  // Background color for the rotator element
    fontSize: "1.5rem",  // Font size for the text
  };

  return (
    <>
      <Typography variant="h4">Random Comments</Typography>
      <TextRotator
        content={content}
        time={settings.interval}
        startDelay={100}
      />
    </>
  );
};

export default TextRotatorComponent;
