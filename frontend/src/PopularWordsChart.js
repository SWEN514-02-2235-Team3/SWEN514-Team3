import React from 'react';
import { Typography, Box, Paper, Grid } from '@mui/material';


const PopularWordsChart = ({ data }) => {
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

        const processData = (data) => {
          let wordsMap = {};
          data.forEach((item) => {
            const words = item.comment.split(/\s+/);
            words.forEach((word) => {
              const cleanedWord = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
              if (cleanedWord.length > 3 && cleanedWord.length < 15
                  && !blacklist.includes(cleanedWord)) {
                wordsMap[cleanedWord] = (wordsMap[cleanedWord] || 0) + 1;
              }
            });
          });
          const wordsArray = Object.keys(wordsMap).map((word) => ({
            name: word,
            frequency: wordsMap[word],
          })).sort((a, b) => b.frequency - a.frequency).slice(0, 10); // Only top 10 words
          const maxFrequency = Math.max(...wordsArray.map(w => w.frequency));
          return { wordsArray, maxFrequency };
        };
      
        const { wordsArray, maxFrequency } = processData(data);
      
        return (
          <>
            <Typography variant="h4" style={{ margin: '20px 0' }}>Popular Words</Typography>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              {wordsArray.map(word => (
                <Box key={word.name} sx={{ mb: 1 }}>
                  <Grid container alignItems="center">
                    <Grid item xs={2}>
                      <Typography variant="body2">{word.name}</Typography>
                    </Grid>
                    <Grid item xs>
                      <Paper variant="outlined" sx={{ position: 'relative', height: 50, bgcolor: 'primary.main' }}>
                        <Box sx={{
                          width: `${(word.frequency / maxFrequency) * 100}%`,
                          height: '100%',
                          bgcolor: 'secondary.main',
                          transition: 'width 0.3s ease-in-out'
                        }} />
                      </Paper>
                    </Grid>
                    <Grid item xs={1}>
                      <Typography variant="body2">{word.frequency}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          </>
        );
      };
      
      export default PopularWordsChart;
      