import React, { useEffect, useState } from 'react';

const TimeAgo = ({ timestamp }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date();
      let date;

      if (timestamp instanceof Date) {
        date = timestamp;
      } else if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp && timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else {
        date = new Date(); // fallback to current date if no valid timestamp is found
      }

      const seconds = Math.floor((now - date) / 1000);

      let interval = seconds / 31536000;
      if (interval > 1) {
        setTimeAgo(Math.floor(interval) + ' years ago');
        return;
      }
      interval = seconds / 2592000;
      if (interval > 1) {
        setTimeAgo(Math.floor(interval) + ' months ago');
        return;
      }
      interval = seconds / 86400;
      if (interval > 1) {
        setTimeAgo(Math.floor(interval) + ' days ago');
        return;
      }
      interval = seconds / 3600;
      if (interval > 1) {
        setTimeAgo(Math.floor(interval) + ' hours ago');
        return;
      }
      interval = seconds / 60;
      if (interval > 1) {
        setTimeAgo(Math.floor(interval) + ' minutes ago');
        return;
      }
      setTimeAgo(Math.floor(seconds) + ' seconds ago');
    };

    updateTimeAgo();
    const intervalId = setInterval(updateTimeAgo, 60000); // update every minute

    return () => clearInterval(intervalId);
  }, [timestamp]);

  return <span>{timeAgo}</span>;
};

export default TimeAgo;
