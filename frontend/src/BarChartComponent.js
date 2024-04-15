import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Typography } from '@mui/material';

const BarChartComponent = ({ data }) => {

  // Parse comment_date and extract month/year
  const parseDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${month}-${year}`;
  };

  // Group sentiments by month/year and count occurrences
  const groupSentimentsByDate = () => {
    const sentimentsByDate = {};
    data.forEach(item => {
      const monthYear = parseDate(item.comment_date);
      if (!sentimentsByDate[monthYear]) {
        sentimentsByDate[monthYear] = {};
      }
      if (item.sentiment in sentimentsByDate[monthYear]) {
        sentimentsByDate[monthYear][item.sentiment]++;
      } else {
        sentimentsByDate[monthYear][item.sentiment] = 1;
      }
    });
  
    // Reverse the monthYear objects because they are backwards by default
    const keys = Object.keys(sentimentsByDate);
    keys.reverse();
    const reversedSentimentsByDate = {};
    keys.forEach(monthYear => {
      reversedSentimentsByDate[monthYear] = sentimentsByDate[monthYear];
    });
  
    return reversedSentimentsByDate;
  };
  

  // Format dataset for BarChart
  const formatDataset = () => {
    const sentimentsByDate = groupSentimentsByDate();
    const formattedDataset = Object.keys(sentimentsByDate).map(date => {
      const sentiments = sentimentsByDate[date];
      return {
        month: date,
        ...sentiments
      };
    });
    return formattedDataset;
  };

  const dataset = formatDataset();

  return (
    <>
      <Typography variant="h4">Sentiments Overview</Typography>
      <BarChart
        dataset={dataset}
        xAxis={[{ label: "Month", scaleType: 'band', dataKey: 'month' }]}
        series={[
          { dataKey: 'POSITIVE', label: 'Positive' },
          { dataKey: 'NEGATIVE', label: 'Negative' },
          { dataKey: 'MIXED', label: 'Mixed' },
          { dataKey: 'NEUTRAL', label: 'Neutral' },
        ]}
        yAxis={[{ label: 'Sentiment Count' }]}
        width={1700}
        height={300}
      />
    </>
  );
};

export default BarChartComponent;
