import { useCallback, useRef, useState } from 'react';
import { convertRange, getDeg } from './utils';
import styles from './Knob.module.css';
import clsx from 'clsx';

// https://codepen.io/edweena/pen/qBLLRVJ
export type KnobProps = {
  min: number;
  max: number;
  step: number;
  degrees?: number;
  label: string;
  radius?: number;
  onChange: (val: number) => void;
  value: number;
};

export const THRESHOLD = 60;

export function Knob(props: KnobProps) {
  const {
    onChange,
    min,
    max,
    step,
    radius = 15,
    degrees = 270,
    label = '',
  } = props;

  let { value } = props;

  const [localValue, setLocalValue] = useState(value);

  let startAngle = (360 - degrees) / 2;
  let endAngle = startAngle + degrees;

  let [deg, setDeg] = useState(
    convertRange(min, max, startAngle, endAngle, localValue)
  );

  const dom = useRef<HTMLDivElement | null>(null);

  const center = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pointerDown = useRef<boolean>(false);
  const controller = useRef<AbortController | null>(null);

  function handleChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const nextVal = parseInt(ev.target.value, 10);

    setLocalValue(nextVal);
    setDeg(convertRange(min, max, startAngle, endAngle, nextVal));
  }

  function handleBlur() {
    let nextVal = localValue;

    if (localValue > max) {
      nextVal = max;
    }
    if (localValue < min) {
      nextVal = min;
    }

    onChange(nextVal);
    setDeg(convertRange(min, max, startAngle, endAngle, nextVal));

    setLocalValue(nextVal);
  }

  const handlePointerMove = useCallback(
    (ev: PointerEvent) => {
      if (!pointerDown.current) return;

      let currentDeg = getDeg(
        center.current.x,
        center.current.y,
        { x: ev.x, y: ev.y },
        startAngle,
        endAngle
      );

      if (currentDeg === startAngle) {
        currentDeg--;
      }

      let newVal = convertRange(startAngle, endAngle, min, max, currentDeg);

      setDeg((d) => {
        const delta = Math.abs(currentDeg - d);
        if (delta > THRESHOLD) return d;
        return currentDeg;
      });

      onChange(newVal);
      setLocalValue(newVal);

      // add some logic to not update degree if the jump
      // is significant
    },
    [center, pointerDown, startAngle, endAngle, min, max, onChange]
  );

  const handlePointerUp = useCallback((ev: PointerEvent) => {
    ev.preventDefault();
    ev.stopPropagation();

    pointerDown.current = false;
    center.current = { x: 0, y: 0 };

    if (controller.current) {
      controller.current.abort();
    }

    controller.current = null;
  }, []);

  const handlePointerDown = useCallback(
    (ev: React.PointerEvent<HTMLDivElement>) => {
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointermove', handlePointerMove);

      pointerDown.current = true;

      const rect = dom.current?.getBoundingClientRect();

      if (!rect) return;

      ev.preventDefault();
      ev.stopPropagation();

      controller.current = new AbortController();

      const { x, y, width, height } = rect;

      center.current = { x: x + width / 2, y: y + height / 2 };

      document.addEventListener('pointerup', handlePointerUp, {
        signal: controller.current.signal,
      });
      document.addEventListener('pointermove', handlePointerMove, {
        passive: true,
        signal: controller.current.signal,
      });
    },
    [pointerDown, handlePointerMove, handlePointerUp]
  );

  return (
    <div
      className={styles.container}
      style={
        {
          '--radius': `${radius}px`,
          '--degrees': `${deg}deg`,
        } as React.CSSProperties
      }
    >
      <div
        className={clsx(styles.knob, styles.outer)}
        ref={dom}
        onPointerDown={handlePointerDown}
      >
        <div className={clsx(styles.knob, styles.inner)}>
          <div className={clsx(styles.grip)} />
        </div>
      </div>
      <label className={styles.label}>
        <p className="uppercase text-center mt-1" style={{ fontSize: '11px' }}>
          {label}
        </p>

        <input
          type="number"
          className={styles.input}
          step={step}
          value={Number.isNaN(localValue) ? '' : localValue.toFixed(0)}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </label>
    </div>
  );
}
