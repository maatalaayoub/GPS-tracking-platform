'use client';

import { Pause, Play, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ReplayControlsProps {
  isPlaying: boolean;
  progress: number; // 0 - 100
  currentIndex: number;
  total: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSeek: (progress: number) => void;
  onSpeedChange: (speed: number) => void;
}

export function ReplayControls({
  isPlaying,
  progress,
  currentIndex,
  total,
  speed,
  onPlay,
  onPause,
  onReset,
  onSeek,
  onSpeedChange,
}: ReplayControlsProps) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <Button variant="outline" size="icon" onClick={onPause}>
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" size="icon" onClick={onPlay}>
              <Play className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="speed" className="text-muted-foreground text-sm">
            Speed
          </Label>
          <select
            id="speed"
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="border-input bg-background h-9 rounded-md border px-2 text-sm"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={5}>5x</option>
            <option value={10}>10x</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={progress}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
        />
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>
            Point {total > 0 ? currentIndex + 1 : 0} / {total}
          </span>
          <span>{progress.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
