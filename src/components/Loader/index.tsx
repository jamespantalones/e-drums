import styles from './loader.module.css';

export function Loader() {
  return (
    <div className={styles.wrapper}>
      <div className="animate-spin">
        <Loader />
      </div>
    </div>
  );
}
