import { useEffect, useRef, useState } from 'react';
import { PanResponder, View, type LayoutChangeEvent } from 'react-native';

type Props = {
  value: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
};

const THUMB = 26;

type Track = { width: number; max: number; step: number; onChange: (value: number) => void };

function valueAt(x: number, { width, max, step }: Track) {
  const ratio = Math.min(1, Math.max(0, x / Math.max(1, width - THUMB)));
  return Math.round((ratio * max) / step) * step;
}

/** Single-thumb "up to $X" slider built on PanResponder, so no extra native module. */
export function PriceSlider({ value, max, step = 5, onChange }: Props) {
  const [width, setWidth] = useState(0);
  // Gesture handlers read the latest props from here; it is only written in an effect.
  const latest = useRef<Track>({ width, max, step, onChange });
  useEffect(() => {
    latest.current = { width, max, step, onChange };
  });

  // The ref is read inside the gesture callbacks only, never during render.
  // eslint-disable-next-line react-hooks/refs
  const [responder] = useState(() => {
    let start = 0;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        start = event.nativeEvent.locationX - THUMB / 2;
        latest.current.onChange(valueAt(start, latest.current));
      },
      onPanResponderMove: (_, gesture) => latest.current.onChange(valueAt(start + gesture.dx, latest.current)),
    });
  });

  const offset = width ? (value / max) * (width - THUMB) : 0;

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Maximum price"
      accessibilityValue={{ min: 0, max, now: value, text: `Up to $${value}` }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) =>
        onChange(Math.min(max, Math.max(0, value + (event.nativeEvent.actionName === 'increment' ? step : -step))))
      }
      onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
      className="h-10 justify-center"
      {...responder.panHandlers}
    >
      <View pointerEvents="none" className="h-1.5 rounded-full bg-line" />
      <View pointerEvents="none" className="absolute h-1.5 rounded-full bg-loop" style={{ width: offset + THUMB / 2 }} />
      <View
        pointerEvents="none"
        className="absolute rounded-full border-[3px] border-loop bg-white"
        style={{ width: THUMB, height: THUMB, left: offset, boxShadow: '0 2px 6px rgba(0,0,0,0.18)' }}
      />
    </View>
  );
}
