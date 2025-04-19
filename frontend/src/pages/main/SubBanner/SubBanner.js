// src/pages/main/SubBanner.js

// css
import styles from './SubBanner.module.css';

export function SubBanner1() {
  return (
    <section className={styles.container}>
      <div className={styles.wrap}>
        <div className={styles.bg1}></div>
        <div className={styles.bgColor}></div>

        <div className={styles.content}>
          <h2>
            <strong>그리운 이름을 다시 불러봅니다</strong>
          </h2>
          <p>
            마음속 깊이 간직했던 기억들이
            <br />
            다시 따뜻한 목소리로 되살아납니다.
          </p>
        </div>
      </div>
    </section>
  );
}

export function SubBanner2() {
  return (
    <>
      <section className={styles.container}>
        <div className={styles.wrap}>
          <div className={styles.bg2}></div>
          <div className={styles.bgColor}></div>

          <div className={styles.content}>
            <h2>
              <strong>시간을 넘어 이어지는 대화</strong>
            </h2>
            <p>
              말하지 못했던 이야기,
              <br />
              지금 이 순간 다시 전할 수 있어요.
            </p>
          </div>
        </div>
      </section>
      <div className={styles.footerSpacer}></div>
    </>
  );
}
