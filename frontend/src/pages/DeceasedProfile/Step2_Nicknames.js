import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDeceasedProfile from '../../zustand/useDeceasedProfile';
import styles from './Deceased.module.css';

export default function Step2_Nicknames() {
  console.log('[zustand 전체 상태2]', useDeceasedProfile.getState());
  const navigate = useNavigate();

  // zustand 상태 & setter
  const {
    deceasedNickname,
    userNickname,
    setDeceasedNickname,
    setUserNickname,
  } = useDeceasedProfile();

  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = () => {
    if (deceasedNickname.trim() && userNickname.trim()) {
      setDeceasedNickname(deceasedNickname.trim());
      setUserNickname(userNickname.trim());
      navigate('/deceased/profile/step3');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>
          고인과 당신의
          <br />
          호칭을 알려주세요.
          <p className={styles.helperText}>
            호칭은 고인과의 대화에서 직접 사용됩니다.
          </p>
        </h2>

        {/* 고인에게 부르는 호칭 */}
        <div className={styles.inputGroup}>
          {(focusedField === 'deceased' || deceasedNickname) && (
            <label className={styles.floatingLabel}>고인을 부르는 호칭</label>
          )}
          <input
            type="text"
            value={deceasedNickname}
            onFocus={() => setFocusedField('deceased')}
            onBlur={() => setFocusedField(null)}
            onChange={(e) => setDeceasedNickname(e.target.value)}
            className={styles.input}
            placeholder={
              focusedField !== 'deceased' && !deceasedNickname
                ? '고인을 부르는 호칭'
                : ''
            }
          />
          {deceasedNickname && (
            <button
              className={styles.clearButton}
              onClick={() => setDeceasedNickname('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* 고인이 나를 부르던 호칭 */}
        <div className={styles.inputGroup}>
          {(focusedField === 'user' || userNickname) && (
            <label className={styles.floatingLabel}>
              고인이 나를 부르던 호칭
            </label>
          )}
          <input
            type="text"
            value={userNickname}
            onFocus={() => setFocusedField('user')}
            onBlur={() => setFocusedField(null)}
            onChange={(e) => setUserNickname(e.target.value)}
            className={styles.input}
            placeholder={
              focusedField !== 'user' && !userNickname
                ? '고인이 나를 부르던 호칭'
                : ''
            }
          />
          {userNickname && (
            <button
              className={styles.clearButton}
              onClick={() => setUserNickname('')}
            >
              ✕
            </button>
          )}
        </div>

        <p className={styles.helperText}>
          예: 할아버지, 엄마 / 민수야, 작은누나 등
        </p>
      </div>

      <button
        className={styles.confirmButton}
        onClick={handleSubmit}
        disabled={!deceasedNickname.trim() || !userNickname.trim()}
      >
        다음
      </button>
    </div>
  );
}
