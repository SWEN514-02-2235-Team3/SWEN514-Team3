import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Typography } from '@mui/material';

const LineChartComponent = ({ data }) => {
  
  
  // Parse comment_date and extract month/year
  const parseDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${month}-${year}`;
  };

  // Count total comments by month/year
  const countCommentsByDate = () => {
    const commentsByDate = {};
    data.forEach(item => {
      const monthYear = parseDate(item.comment_date);
      if (!commentsByDate[monthYear]) {
        commentsByDate[monthYear] = 1;
      } else {
        commentsByDate[monthYear]++;
      }
    });
  
    // Reverse the monthYear objects because they are backwards by default
    const keys = Object.keys(commentsByDate);
    keys.reverse();
    const reversedCommentsByDate = {};
    keys.forEach(monthYear => {
      reversedCommentsByDate[monthYear] = commentsByDate[monthYear];
    });
  
    return reversedCommentsByDate;
  };
  

  // Format dataset for LineChart
  const formatDataset = () => {
    const commentsByDate = countCommentsByDate();
    const formattedDataset = Object.keys(commentsByDate).map(date => ({
      month: date,
      totalComments: commentsByDate[date]
    }));
    return formattedDataset;
  };

  const dataset = formatDataset();

  return (
    <>
      <Typography variant="h4">Comments Overview</Typography>
      <LineChart
        dataset={dataset}
        xAxis={[{ label: "Month", scaleType: 'band', dataKey: 'month' }]}
        series={[
          { dataKey: 'totalComments', label: 'Total Comments' }
        ]}
        yAxis={[{ label: 'Total Comments' }]}
        width={1700}
        height={300}
      />
    </>
  );
};

export default LineChartComponent;