import * as React from 'react';
import clsx from 'clsx';
import styles from './IconButton.module.css';
import { motion } from 'framer-motion';

type Props = {
  children: React.ReactNode;
  className?: string;
  fill?: string;
  color?: string;
  onClick?: () => void | any;
  border?: boolean;
  disabled?: boolean;
  small?: boolean;
  margin?: boolean;
  muted?: boolean;
  title?: string;
};

const Button = React.forwardRef<HTMLButtonElement, Props>(function Component(
  props,
  ref
) {
  const {
    title,
    fill,
    color,
    children,
    onClick,
    small,
    disabled,
    border = false,
  } = props;

  const cx = clsx(styles.button, {
    [styles.small]: small,
    [styles.useBorder]: border,
  });
  return (
    <button
      ref={ref}
      onClick={onClick}
      type="button"
      title={title}
      className={cx}
      disabled={Boolean(disabled)}
      style={{
        ...(fill && { backgroundColor: fill }),
        ...(color && { color }),
      }}
    >
      {children}
    </button>
  );
});

export const IconButton = motion(Button);
