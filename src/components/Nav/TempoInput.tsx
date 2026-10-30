import { useCallback } from 'react';
import styles from './TempoInput.module.css';

export function TempoInput({
  onChange,
  label,
  value,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) {
  const handleChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      if (ev.target.value) {
        onChange(parseInt(ev.target.value, 10));
      }
    },
    [onChange],
  );

  return (
    <label className={styles.label}>
      <input
        value={value}
        type="number"
        min="50"
        max="300"
        onChange={handleChange}
        className={styles.input}
        name="Tempo"
        autoComplete="off"
      />
      <span className="block mt-1">TEMPO</span>
    </label>
  );
}
