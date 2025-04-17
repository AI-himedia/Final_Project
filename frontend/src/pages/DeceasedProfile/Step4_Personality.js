import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDeceasedProfile from '../../redux/Store/useDeceasedProfile';
import styles from './Deceased.module.css';

export default function Step4_Personality() {
  const [selected, setSelected] = useState([]);
  const [custom, setCustom] = useState('');
  const [focused, setFocused] = useState(false);

  const setPersonality = useDeceasedProfile((state) => state.setPersonality);
  const profile = useDeceasedProfile();
  console.log('[Zustand] Step4 상태:', profile);

  const navigate = useNavigate();

  const keywords = [
    '따뜻한',
    '유쾌한',
    '조용한',
    '다정한',
    '털털한',
    '사려 깊은',
    '책임감 있는',
    '묵묵히 도와준',
    '조언을 잘 해주던',
    '가족 같은',
    '친구 같은',
    '늘 웃던',
    '표현이 서툰',
    '배려 깊은',
    '마지막까지 걱정하던',
  ];

  const toggleKeyword = (word) => {
    setSelected((prev) =>
      prev.includes(word)
        ? prev.filter((k) => k !== word)
        : prev.length < 3
        ? [...prev, word]
        : prev
    );
  };

  const handleSubmit = () => {
    const all = [...selected];
    if (custom.trim()) all.push(custom.trim());
    setPersonality(all);
    navigate('/deceased/profile/step5');
  };

  return (
    <div className={styles.container}>
      <div>
        <h2 className={styles.title}>
          고인의 어떤 점이
          <br />
          가장 기억에 남으시나요?
        </h2>

        {/* 직접 입력 */}
        <div className={styles.inputGroup} style={{ marginTop: '2rem' }}>
          {(focused || custom) && (
            <label className={styles.floatingLabel}>직접 입력</label>
          )}
          <input
            type="text"
            value={custom}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => setCustom(e.target.value)}
            className={styles.input}
            placeholder={!focused && !custom ? '예: 늘 따뜻한 말을 건네던' : ''}
          />
          {custom && (
            <button
              className={styles.clearButton}
              onClick={() => setCustom('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <p className={styles.helperText}>
        * 최대 3개까지 선택하거나, 직접 입력할 수 있어요.
      </p>

      <div className={styles.optionGroup}>
        {keywords.map((word) => (
          <button
            key={word}
            type="button"
            className={`${styles.optionButton} ${
              selected.includes(word) ? styles.selected : ''
            }`}
            onClick={() => toggleKeyword(word)}
          >
            {word}
          </button>
        ))}
      </div>

      <button
        className={styles.confirmButton}
        onClick={handleSubmit}
        disabled={selected.length === 0 && !custom.trim()}
      >
        다음
      </button>
    </div>
  );
}
