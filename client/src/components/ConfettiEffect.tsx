import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

interface ConfettiEffectProps {
  duration?: number; // duration in milliseconds
}

export function ConfettiEffect({ duration = 5000 }: ConfettiEffectProps) {
  const { width, height } = useWindowSize();
  const [recycle, setRecycle] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRecycle(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <Confetti
      width={width}
      height={height}
      recycle={recycle}
      numberOfPieces={200}
      colors={["#22c55e", "#78350f", "#f97316", "#ef4444"]} // green, brown, orange, red
      gravity={0.15}
      initialVelocityY={10}
      tweenDuration={5000}
    />
  );
}
