import React, { useEffect } from 'react';
import { useTimer } from 'use-timer';

function Timer({ second }) {
  const { time, start } = useTimer({
    initialTime: second / 1000,
    timerType: 'DECREMENTAL'
  });

  useEffect(() => {
    start();
  }, [])

  return <span>{time}</span>;
}

Timer.propTypes = {};

Timer.defaultProps = {};

export default Timer;
