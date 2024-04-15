import React from "react";
import WordCloud from "react-d3-cloud"; // Adjusted import for default export
import * as d3 from "d3";
import ReactWordcloud from 'react-wordcloud';
import { Typography } from "@mui/material";
import { TagCloud } from 'react-tagcloud'

const WordCloudComponent = ({ data }) => {
  const processData = (data) => {
    let wordsMap = {};
    data.forEach((item) => {
      const words = item.comment.split(/\s+/);
      words.forEach((word) => {
        //ewww regex stuff for normalizing everything.
        const cleanedWord = word.replace(/[^a-zA-Z ]/g, "").toLowerCase();
        if (cleanedWord.length > 3 && cleanedWord.length < 15) {
          // Only consider words longer than 3 characters - TODO, update this to a more comprehensive filtering method
          wordsMap[cleanedWord] = (wordsMap[cleanedWord] || 0) + 1;
        }
      });
    });
    return Object.keys(wordsMap).map((word) => ({
      // text: word,            // ReactWordcloud
      // value: wordsMap[word], // ReactWordcloud
      value: word,              // TagCloud
      count: wordsMap[word],    // TagCloud
    }));
  };

  const wordData = processData(data);

  const options = {
    rotations: 0,
    rotationAngles: [-90, 0],
    fontSizes: [50, 300],
  };

  const callbacks = {
    getWordTooltip: word => `${word.text} (${word.value})`,
  }

  const size = [1100, 500];
  return (
    <>
    <Typography variant="h4">Word Cloud</Typography>
    {/* <ReactWordcloud
      words={wordData}
      callbacks={callbacks}
      size={size}
      options={options}
    /> */}
    <TagCloud
      tags={wordData}
      minSize={25}
      maxSize={150}
    />
    </>
  );
};

export default WordCloudComponent;
