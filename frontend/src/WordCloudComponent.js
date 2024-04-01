import React from "react";
import WordCloud from "react-d3-cloud"; // Adjusted import for default export
import * as d3 from "d3";

const WordCloudComponent = ({ data }) => {
  const processData = (data) => {
    let wordsMap = {};
    data.forEach((item) => {
      const words = item.comment.split(/\s+/);
      words.forEach((word) => {
        //ewww regex stuff for normalizing everything.
        const cleanedWord = word.replace(/[^a-zA-Z ]/g, "").toLowerCase();
        if (cleanedWord.length > 3) {
          // Only consider words longer than 3 characters - TODO, update this to a more comprehensive filtering method
          wordsMap[cleanedWord] = (wordsMap[cleanedWord] || 0) + 1;
        }
      });
    });
    return Object.keys(wordsMap).map((word) => ({
      text: word,
      value: wordsMap[word],
    }));
  };

  const wordData = processData(data);

  const fontSizeMapper = (word) => Math.log2(word.value) * 5; // Adjust the size scaling as needed

  return (
    <WordCloud
      data={wordData}
      fontSizeMapper={fontSizeMapper}
      width={60}
      height={40}
    />
  );
};

export default WordCloudComponent;
