import React, { useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CirclePause,
  Gauge,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Zap,
} from 'lucide-react';

export const REPLAY_SPEEDS = {
  '0.5x': 1200,
  '1x': 650,
  '2x': 325,
  '4x': 150,
};

function formatClock(seconds) {
  const value = Math.max(0, Number(seconds) || 0);
  const minutes = String(Math.floor(value / 60)).padStart(2, '0');
  const secs = String(Math.floor(value % 60)).padStart(2, '0');
  return `${minutes}:${secs}`;
}

function eventSeconds(timestamp) {
  if (!timestamp) return 0;
  const parts = timestamp.split(':').map(Number);
  return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
}

export default function ReplayEngine2({
  events = [],
  visibleEvents,
  setVisibleEvents,
  playing,
  setPlaying,
  speed,
  setSpeed,
  onActiveEvent,
}) {
  const max = events.length;
  const activeEvent = visibleEvents > 0 ? events[visibleEvents - 1] : null;
  const elapsed = activeEvent ? eventSeconds(activeEvent.timestamp) : 0;
  const total = events.length ? eventSeconds(events.at(-1).timestamp) : 0;
  const progress = max ? (visibleEvents / max) * 100 : 0;

  const markers = useMemo(
    () =>
      events.map((event, index) => ({
        id: event.id ?? index,
        left: max <= 1 ? 0 : (index / (max - 1)) * 100,
        severity: event.severity || 'low',
        type: event.event_type || 'event',
        label: `${event.timestamp} — ${event.action}`,
      })),
    [events, max],
  );

  useEffect(() => {
    if (!playing || !max) return undefined;
    if (visibleEvents >= max) {
      setPlaying(false);
      return undefined;
    }

    const timer = window.setTimeout(
      () => setVisibleEvents((value) => Math.min(max, value + 1)),
      REPLAY_SPEEDS[speed] || REPLAY_SPEEDS['1x'],
    );

    return () => window.clearTimeout(timer);
  }, [playing, max, visibleEvents, speed, setPlaying, setVisibleEvents]);

  useEffect(() => {
    onActiveEvent?.(activeEvent);
  }, [activeEvent, onActiveEvent]);

  useEffect(() => {
    const handler = (event) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (event.code === 'Space') {
        event.preventDefault();
        if (visibleEvents < max) setPlaying((value) => !value);
      }

      if (event.code === 'ArrowLeft') {
        event.preventDefault();
        setPlaying(false);
        setVisibleEvents((value) => Math.max(0, value - 1));
      }

      if (event.code === 'ArrowRight') {
        event.preventDefault();
        setPlaying(false);
        setVisibleEvents((value) => Math.min(max, value + 1));
      }

      if (event.code === 'Home') {
        setPlaying(false);
        setVisibleEvents(0);
      }

      if (event.code === 'End') {
        setPlaying(false);
        setVisibleEvents(max);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [max, setPlaying, setVisibleEvents, visibleEvents]);

  const seek = (value) => {
    setPlaying(false);
    setVisibleEvents(Math.max(0, Math.min(max, value)));
  };

  return (
    <section className="replay2">
      <div className="replay2-controls">
        <button
          type="button"
          onClick={() => seek(0)}
          title="Reset replay (Home)"
        >
          <RotateCcw size={16} />
          RESET
        </button>

        <button
          type="button"
          onClick={() => seek(Math.max(0, visibleEvents - 1))}
          title="Previous event (Left Arrow)"
        >
          <ChevronLeft size={17} />
          PREV
        </button>

        <button
          type="button"
          className="replay2-primary"
          disabled={!max || visibleEvents >= max}
          onClick={() => setPlaying((value) => !value)}
          title="Play or pause (Space)"
        >
          {playing ? <CirclePause size={17} /> : <Play size={17} />}
          {playing ? 'PAUSE' : visibleEvents ? 'RESUME' : 'RUN REPLAY'}
        </button>

        <button
          type="button"
          onClick={() => seek(Math.min(max, visibleEvents + 1))}
          title="Next event (Right Arrow)"
        >
          NEXT
          <ChevronRight size={17} />
        </button>

        <button
          type="button"
          onClick={() => seek(max)}
          title="Complete replay (End)"
        >
          <SkipForward size={17} />
          COMPLETE
        </button>

        <label className="replay2-speed">
          <Gauge size={15} />
          <select
            value={speed}
            onChange={(event) => setSpeed(event.target.value)}
            aria-label="Replay speed"
          >
            {Object.keys(REPLAY_SPEEDS).map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="replay2-track-wrap">
        <div className="replay2-track">
          <div className="replay2-fill" style={{ width: `${progress}%` }} />

          {markers.map((marker, index) => (
            <button
              type="button"
              key={marker.id}
              className={[
                'replay2-marker',
                `replay2-${marker.severity}`,
                index < visibleEvents ? 'replay2-observed' : '',
                index === visibleEvents - 1 ? 'replay2-active' : '',
              ].join(' ')}
              style={{ left: `${marker.left}%` }}
              title={marker.label}
              onClick={() => seek(index + 1)}
              aria-label={marker.label}
            />
          ))}

          <input
            type="range"
            min="0"
            max={max}
            step="1"
            value={visibleEvents}
            onChange={(event) => seek(Number(event.target.value))}
            aria-label="Replay timeline"
          />
        </div>

        <div className="replay2-meta">
          <span>
            <Zap size={13} />
            EVENT {visibleEvents}/{max}
          </span>
          <time>{formatClock(elapsed)} / {formatClock(total)}</time>
          <span className={`replay2-state ${playing ? 'live' : ''}`}>
            {playing ? 'LIVE TELEMETRY' : visibleEvents === max && max ? 'REPLAY COMPLETE' : 'SNAPSHOT'}
          </span>
        </div>
      </div>

      <div className="replay2-shortcuts">
        <kbd>SPACE</kbd> play/pause
        <kbd>←</kbd><kbd>→</kbd> step
        <kbd>HOME</kbd> reset
        <kbd>END</kbd> complete
      </div>
    </section>
  );
}
