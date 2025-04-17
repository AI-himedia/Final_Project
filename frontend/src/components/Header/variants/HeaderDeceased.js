import styles from '../Header.module.css';

export default function HeaderDeceased() {
  return (
    <header className={`${styles.Header_Container} ${styles.Header_Default}`}>
      <div className={styles.Header_Inner}>
        <div className={(styles.Header_Logo, styles.Header_Black)}>
          다시, 안녕
        </div>
      </div>
    </header>
  );
}
