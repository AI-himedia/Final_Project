import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDeceasedProfile from '../../redux/Store/useDeceasedProfile';
import styles from './Deceased.module.css';

export default function Step2_Nicknames() {
  const [deceasedNickname, setDeceasedNicknameLocal] = useState('');
  const [userNickname, setUserNicknameLocal] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const profile = useDeceasedProfile();
  console.log('[Zustand] Step2 전체 상태:', profile);

  const setDeceasedNickname = useDeceasedProfile(
    (state) => state.setDeceasedNickname
  );
  const setUserNickname = useDeceasedProfile((state) => state.setUserNickname);

  const navigate = useNavigate();

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
            onChange={(e) => setDeceasedNicknameLocal(e.target.value)}
            className={styles.input}
            placeholder={
              focusedField !== 'deceased' && !deceasedNickname
                ? '할아버지, 할머니'
                : ''
            }
          />
          {deceasedNickname && (
            <button
              className={styles.clearButton}
              onClick={() => setDeceasedNicknameLocal('')}
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
            onChange={(e) => setUserNicknameLocal(e.target.value)}
            className={styles.input}
            placeholder={
              focusedField !== 'user' && !userNickname ? '~아, ~누나' : ''
            }
          />
          {userNickname && (
            <button
              className={styles.clearButton}
              onClick={() => setUserNicknameLocal('')}
            >
              ✕
            </button>
          )}
        </div>

        <p className={styles.helperText}>
          * 서로를 어떻게 불렀는지 기억나는 대로 적어주세요.
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
