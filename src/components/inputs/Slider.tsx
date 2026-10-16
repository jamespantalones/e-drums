import { CSSProperties, useState } from 'react';
import clsx from 'clsx';
import styles from './slider.module.css';
import { normalize, padNumber } from '../../utils';
import { useSignals } from '@preact/signals-react/runtime';

export type Props = {
  value?: number;
  defaultValue?: number;
  mockValue?: number;
  label: string;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** footer: label beside a tall meter; track: slim meter, label below */
  variant?: 'footer' | 'track';
};

export function Slider(props: Props) {
  useSignals();

  const { variant = 'track' } = props;
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

  const current = props.mockValue ?? props.value ?? val ?? 0;
  const fill = normalize(current, props.min || 0, props.max || 100);

  return (
    <label
      className={clsx(styles.slider, styles[variant])}
      style={{ '--fill': `${fill}%` } as CSSProperties}
    >
      <input
        type="range"
        onChange={handleChange}
        {...(props.value !== undefined && {
          value: props.value,
        })}
        {...(props.defaultValue !== undefined && {
          defaultValue: val,
        })}
        {...attrs}
      />
      <span>
        {props.label} {padNumber(current)}
      </span>
    </label>
  );
}
