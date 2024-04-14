import * as React from 'react';
import { PieChart } from '@mui/x-charts';
import { Typography } from "@mui/material";

const PieChartComponent = ({ data }) => {
 

  const countSentiments = () => {
    const sentiments = {};
    data.forEach(item => {
      if (item.sentiment in sentiments) {
        sentiments[item.sentiment]++;
      } else {
        sentiments[item.sentiment] = 1;
      }
    });
    return sentiments;
  };

  const generateSeries = () => {
    const sentimentsCount = countSentiments();
    return Object.keys(sentimentsCount).map((sentiment, index) => ({
      id: index,
      value: sentimentsCount[sentiment],
      label: sentiment
    }));
  };

  const series = generateSeries();

  return (
    <>
      <Typography variant="h4">Sentiments</Typography>
      <PieChart
        series={[{ data: series }]}
        width={500}
        height={200}
      />
    </>
  );
};

export default PieChartComponent;