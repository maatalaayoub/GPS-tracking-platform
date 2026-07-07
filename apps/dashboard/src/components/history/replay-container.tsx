'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { RouteReplayMap } from './route-replay-map';
import { ReplayControls } from './replay-controls';
import type { HistoryPosition } from '@/types/tracking';

interface ReplayContainerProps {
  positions: HistoryPosition[];
}

const BASE_INTERVAL_MS = 1000;

export default function ReplayContainer({ positions }: ReplayContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = positions.length;
  const progress = total > 0 ? (currentIndex / (total - 1)) * 100 : 0;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    if (total === 0) return;
    setIsPlaying(true);
  }, [total]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
  }, []);

  const seek = useCallback(
    (value: number) => {
      const index = Math.min(
        total - 1,
        Math.max(0, Math.round((value / 100) * (total - 1))),
      );
      setCurrentIndex(index);
    },
    [total],
  );

  // Advance the replay cursor while playing.
  useEffect(() => {
    if (!isPlaying) {
      clearTimer();
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= total - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, BASE_INTERVAL_MS / speed);

    return () => clearTimer();
  }, [isPlaying, total, speed, clearTimer]);

  // Reset when the positions list changes.
  useEffect(() => {
    reset();
  }, [positions, reset]);

  return (
    <div className="flex h-[500px] flex-col gap-4 lg:h-[600px]">
      <div className="relative flex-1 overflow-hidden rounded-lg border shadow-sm">
        <RouteReplayMap positions={positions} currentIndex={currentIndex} />
      </div>

      <ReplayControls
        isPlaying={isPlaying}
        progress={progress}
        currentIndex={currentIndex}
        total={total}
        speed={speed}
        onPlay={play}
        onPause={pause}
        onReset={reset}
        onSeek={seek}
        onSpeedChange={setSpeed}
      />
    </div>
  );
}
