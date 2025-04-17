import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDeceasedProfile from '../../zustand/useDeceasedProfile';
import styles from './Deceased.module.css';

export default function Step5_SpeakingTone() {
  const [selectedTone, setSelectedTone] = useState(null);
  const setSpeakingTone = useDeceasedProfile((state) => state.setSpeakingTone);
  const profile = useDeceasedProfile();
  console.log('[Zustand] Step5 상태:', profile);

  const navigate = useNavigate();

  const handleSubmit = () => {
    if (selectedTone !== null) {
      setSpeakingTone(selectedTone);
      navigate('/deceased/profile/step6');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>
          고인의 말은
          <br />
          어떤 스타일이었나요?
        </h2>

        <p className={styles.helperText}>
          * 반말은 친근한 느낌, 존댓말은 예의를 담은 표현이에요.
        </p>

        <div className={styles.optionGroup}>
          <button
            type="button"
            className={`${styles.optionButton} ${
              selectedTone === true ? styles.selected : ''
            }`}
            onClick={() => setSelectedTone(true)}
          >
            반말
          </button>
          <button
            type="button"
            className={`${styles.optionButton} ${
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
