import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDeceasedProfile from '../../zustand/useDeceasedProfile';
import styles from './Deceased.module.css';

export default function Step5_SpeakingTone() {
  const navigate = useNavigate();

  const speakingTone = useDeceasedProfile((state) => state.speakingTone);
  const setSpeakingTone = useDeceasedProfile((state) => state.setSpeakingTone);

  const [selectedTone, setSelectedTone] = useState(null);

  // 초기 zustand 값 반영
  useEffect(() => {
    if (typeof speakingTone === 'boolean') {
      setSelectedTone(speakingTone);
    }
  }, [speakingTone]);

  const handleSubmit = () => {
    if (selectedTone !== null) {
      setSpeakingTone(selectedTone);
      navigate('/deceased/profile/step6');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title} style={{ marginBottom: '-0.1rem' }}>
          고인의 말은
          <br />
          어떤 스타일이었나요?
          <p className={styles.helperText}>
            반말은 친근한 느낌, 존댓말은 예의를 담은 표현이에요.
          </p>
        </h2>

        <div className={styles.toneGroup}>
          <button
            type="button"
            className={`${styles.toneButton} ${
              selectedTone === true ? styles.selected : ''
            }`}
            onClick={() => setSelectedTone(true)}
          >
            반말
          </button>
          <button
            type="button"
            className={`${styles.toneButton} ${
              selectedTone === false ? styles.selected : ''
            }`}
            onClick={() => setSelectedTone(false)}
          >
            존댓말
          </button>
        </div>
      </div>

      <button
        className={styles.confirmButton}
        onClick={handleSubmit}
        disabled={selectedTone === null}
      >
        다음
      </button>
    </div>
  );
}
