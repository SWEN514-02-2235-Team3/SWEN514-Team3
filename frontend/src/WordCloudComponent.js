import React from "react";
import WordCloud from "react-d3-cloud"; // Adjusted import for default export
import * as d3 from "d3";
import ReactWordcloud from 'react-wordcloud';
import { Typography } from "@mui/material";
import { TagCloud } from 'react-tagcloud'

const WordCloudComponent = ({ data }) => {
  const blacklist = [
    // Filler words
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
    'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before',
    'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
    'could', 'couldn', 'couldn\'t', 'd', 'did', 'didn', 'didn\'t', 'do', 'does',
    'doesn', 'doesn\'t', 'doing', 'don', 'don\'t', 'down', 'during', 'each', 'few',
    'for', 'from', 'further', 'had', 'hadn', 'hadn\'t', 'has', 'hasn', 'hasn\'t',
    'have', 'haven', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her',
    'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s',
    'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn', 'isn\'t',
    'it', 'it\'s', 'its', 'itself', 'just', 'll', 'm', 'ma', 'me', 'mightn',
    'mightn\'t', 'more', 'most', 'mustn', 'mustn\'t', 'my', 'myself', 'needn',
    'needn\'t', 'no', 'nor', 'not', 'now', 'o', 'of', 'off', 'on', 'once', 'only',
    'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 're', 's', 'same',
    'shan', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'should\'ve',
    'shouldn', 'shouldn\'t', 'so', 'some', 'such', 't', 'than', 'that', 'that\'ll',
    'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
    'there\'d', 'there\'ll', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll',
    'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under',
    'until', 'up', 've', 'very', 'was', 'wasn', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
    'we\'re', 'we\'ve', 'were', 'weren', 'weren\'t', 'what', 'what\'ll', 'what\'s',
    'when', 'when\'ll', 'when\'s', 'where', 'where\'d', 'where\'ll', 'where\'s',
    'which', 'while', 'who', 'who\'ll', 'who\'s', 'whom', 'why', 'why\'ll', 'why\'s',
    'with', 'won', 'won\'t', 'would', 'would\'ve', 'wouldn', 'wouldn\'t', 'y', 'you',
    'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves',
    'thats', 'will', 'isnt', 'dont',

    // Inappropriate words
    'ass', 'asses', 'asshole', 'assholes', 'asshat', 'asswipe', 'asswipes',
    'bastard', 'bastards', 'bitch', 'bitches', 'bollocks', 'bullshit', 'bullshitter', 'bullshitters',
    'cock', 'cocks', 'cocksucker', 'cocksuckers', 'cunt', 'cunts', 'damn', 'damned', 'damnit', 'dick',
    'dicks', 'dickhead', 'dickheads', 'fucker', 'fuckers', 'fucking', 'fuckhead', 'fuckheads', 'fuckup',
    'fuckups', 'fucks', 'goddamn', 'goddamned', 'hell', 'motherfucker', 'motherfuckers', 'motherfucking',
    'nigger', 'niggers', 'nigga', 'niggas', 'piss', 'pisses', 'pissed', 'pissing', 'prick', 'pricks',
    'pussy', 'pussies', 'shit', 'shits', 'shitter', 'shitters', 'shitted', 'shitting', 'shithead', 'shitheads',
    'slut', 'sluts', 'twat', 'twats', 'wanker', 'wankers', 'whore', 'whores',
    'chink', 'coon', 'gook', 'kike', 'nigger', 'spic', 'wetback', 'camel jockey',
    'raghead', 'towelhead', 'slope', 'jap', 'beaner', 'wop', 'nip', 'slopehead',
    'muzzie', 'ape', 'sambo', 'darkie', 'quadroon', 'mulatto',
    'fuck', 'fucks', 'fucked', 'fucking', 'fucker', 'fuckers', 'fuckhead', 'fuckheads',
    'fucked up', 'booty', 'boob', 'boobs', 'breast', 'breasts', 'butt', 'butts', 'clit',
    'clitoris', 'cock', 'cocks', 'dick', 'dildo', 'erect', 'erection', 'horny', 'jerk off',
    'masturbate', 'masturbation', 'nipple', 'nipples', 'orgasm', 'penis', 'pussy', 'vagina',
    'tit', 'tits', 'whore', 'sucker', 'suckers', 'wank', 'wanks', 'wanked', 'wanking',
  ];

  function word(value, sentiment) {
    const wordObject = {
      value: value,
      count: 1,
      positive: 0,
      neutral: 0,
      negative: 0,
      mixed: 0,
      dominantSentiment: "neutral" // Default value
    };
  
    if (sentiment === "positive") {
      wordObject.positive = 1;
    } else if (sentiment === "neutral") {
      wordObject.neutral = 1;
    } else if (sentiment === "negative") {
      wordObject.negative = 1;
    } else if (sentiment === "mixed") {
      wordObject.mixed = 1;
    }
  
    const maxSentiment = Math.max(wordObject.positive, wordObject.neutral, wordObject.negative, wordObject.mixed);
    if (maxSentiment === wordObject.positive) {
      wordObject.dominantSentiment = "positive";
    } else if (maxSentiment === wordObject.negative) {
      wordObject.dominantSentiment = "negative";
    } else if (maxSentiment === wordObject.mixed) {
      wordObject.dominantSentiment = "mixed";
    }
  
    return wordObject;
  }

  function incrementWord(wordObject, sentiment) {
    wordObject.count += 1;
    
    if (sentiment === "positive") {
      wordObject.positive += 1;
    } else if (sentiment === "neutral") {
      wordObject.neutral += 1;
    } else if (sentiment === "negative") {
      wordObject.negative += 1;
    } else if (sentiment === "mixed") {
      wordObject.mixed += 1;
    }

    const maxSentiment = Math.max(wordObject.positive, wordObject.neutral, wordObject.negative, wordObject.mixed);
    if (maxSentiment === wordObject.positive) {
      wordObject.dominantSentiment = "positive";
    } else if (maxSentiment === wordObject.negative) {
      wordObject.dominantSentiment = "negative";
    } else if (maxSentiment === wordObject.mixed) {
      wordObject.dominantSentiment = "mixed";
    }
  }

  const processData = (data) => {
    let wordsMap = {};
    data.forEach((item) => {
      const sentiment = item.sentiment
      const words = item.comment.split(/\s+/);
      words.forEach((word) => {
        // regex to normalize words
        const cleanedWord = word.replace(/[^a-zA-Z ]/g, "").toLowerCase();
        
        if (cleanedWord.length > 3 && cleanedWord.length < 15
          && !blacklist.includes(cleanedWord)) {
          wordsMap[cleanedWord] = (wordsMap[cleanedWord] || 0) + 1;
        }
      });
    });

    const sortedWords = Object.keys(wordsMap).sort((a, b) => wordsMap[b] - wordsMap[a]);
    const topWords = sortedWords.slice(0, 100);

    return topWords.map((word) => ({
      value: word,
      count: wordsMap[word],
      // color: word.length > 7 ? 'red' : 'green'
    }));
  };

  const wordData = processData(data);

  const options = {
    rotations: 0,
    rotationAngles: [-90, 0],
    fontSizes: [50, 100],
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
      minSize={10}
      maxSize={250}
    />
    </>
  );
};

export default WordCloudComponent;
