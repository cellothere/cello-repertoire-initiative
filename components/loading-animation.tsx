// components/LoadingAnimation.tsx
import React, { useState, useEffect } from 'react';
import { HiMusicNote } from "react-icons/hi";

const LoadingAnimation: React.FC = () => {
  const [noteCount, setNoteCount] = useState(1); // State to track the number of notes

  useEffect(() => {
    const timer = setTimeout(() => {
      if (noteCount < 10) {
        setNoteCount(noteCount + 1); // Increment note count
      } else {
        setNoteCount(1); // Reset note count after reaching 10
      }
    }, 1000); // Delay of 1 second (1000 ms) between each note

    return () => clearTimeout(timer); // Cleanup function to clear timeout on unmount
  }, [noteCount]); // useEffect dependency on noteCount

  return (
    <div>
      Loading{' '}
      {[...Array(noteCount)].map((_, index) => (
        <HiMusicNote key={index} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
      ))}
    </div>
  );
};

export default LoadingAnimation;
