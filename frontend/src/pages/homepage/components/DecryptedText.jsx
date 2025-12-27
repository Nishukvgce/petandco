import React, { useState, useEffect } from 'react';

const DecryptedText = ({
  text,
  speed = 100,
  maxIterations = 20,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!?',
  className = '',
}) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let iterations = 0;
    const interval = setInterval(() => {
      if (iterations >= maxIterations) {
        setDisplayedText(text);
        clearInterval(interval);
        return;
      }

      const scrambledText = text
        .split('')
        .map((char) =>
          Math.random() > 0.5 ? characters[Math.floor(Math.random() * characters.length)] : char
        )
        .join('');

      setDisplayedText(scrambledText);
      iterations++;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, maxIterations, characters]);

  return <span className={className}>{displayedText}</span>;
};

export default DecryptedText;