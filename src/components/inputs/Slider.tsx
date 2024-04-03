import { CSSProperties, useEffect, useState } from 'react';
import styles from './slider.module.css';
import { normalize, padNumber, scaleColor } from '../../utils';
import { useSignals } from '@preact/signals-react/runtime';
import { effect } from '@preact/signals-react';

export type Props = {
  value?: number;
  defaultValue?: number;
  mockValue?: number;
  label: string;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

export function Slider(props: Props) {
  useSignals();

  const [val, setVal] = useState<number | undefined>(props.defaultValue);

  function handleChange(ev: React.ChangeEvent<HTMLInputElement>) {
    props.onChange(+ev.target.value);
    setVal(+ev.target.value);
  }

  const attrs = {
    ...(props.max && {
      max: props.max,
    }),
    ...(props.min && {
      min: props.min,
    }),
    ...(props.step && {
      step: props.step,
    }),
  };

  const n = normalize(
    props.mockValue || props.value || 0,
    props.min || 0,
    props.max || 100
  );

  return (
    <label
      className={styles.slider}
      style={
        {
          '--grayscale': Math.round(150 - n) / 100,
          '--track': scaleColor(n),
        } as CSSProperties
      }
    >
      <input
        type="range"
        onChange={handleChange}
        {...(props.value && {
          value: props.value,
        })}
        {...(props.defaultValue && {
          defaultValue: val,
        })}
        {...attrs}
      />
      <span>
        {props.label} {padNumber(props.value || val)}
      </span>
    </label>
  );
}
