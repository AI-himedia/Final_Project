import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDeceasedProfile from '../../zustand/useDeceasedProfile';
import styles from './Deceased.module.css';

export default function Step4_Personality() {
  const navigate = useNavigate();

  const personality = useDeceasedProfile((state) => state.personality);
  const setPersonality = useDeceasedProfile((state) => state.setPersonality);

  const [focused, setFocused] = useState(false);
  const [custom, setCustom] = useState('');
  const [selected, setSelected] = useState([]);

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

  // custom 입력 여부에 따른 키워드 선택 비활성화 상태
  const isKeywordDisabled = custom.trim() !== '';

  // 키워드 3개 선택 여부에 따른 input 비활성화 상태
  const isInputDisabled = selected.length >= 3;

  // 최초 로딩 시 personality 데이터 처리
  useEffect(() => {
    console.log('현재 personality 값:', personality);

    // personality가 문자열인 경우 (zustand에서 가져온 데이터)
    if (typeof personality === 'string' && personality.trim() !== '') {
      // 키워드 목록에 있는지 확인
      if (keywords.includes(personality)) {
        setSelected([personality]);
      } else {
        // 키워드에 없으면 custom 입력으로 처리
        setCustom(personality);
      }
    }
    // personality가 배열인 경우 (이전 선택 데이터)
    else if (Array.isArray(personality) && personality.length > 0) {
      // 키워드에 있는 항목은 selected로
      const keywordItems = personality.filter((p) => keywords.includes(p));
      setSelected(keywordItems);

      // 키워드에 없는 항목은 custom으로 (첫 번째 항목만)
      const nonKeywordItem = personality.find((p) => !keywords.includes(p));
      if (nonKeywordItem) {
        setCustom(nonKeywordItem);
      }
    }
  }, [personality]);

  const toggleKeyword = (word) => {
    // custom 입력값이 있으면 키워드 선택 불가
    if (isKeywordDisabled) return;

    let updatedSelection = [...selected];
    if (updatedSelection.includes(word)) {
      updatedSelection = updatedSelection.filter((k) => k !== word);
    } else if (updatedSelection.length < 3) {
      updatedSelection.push(word);
    }

    setSelected(updatedSelection);

    // 업데이트된 선택과 custom 값을 결합하여 zustand 상태 업데이트
    const merged = custom.trim()
      ? [...updatedSelection, custom.trim()]
      : updatedSelection;
    setPersonality(merged);
  };

  const handleSubmit = () => {
    const merged = custom.trim() ? [...selected, custom.trim()] : [...selected];
    setPersonality(merged);
    navigate('/deceased/profile/step5');
  };

  const handleCustomChange = (e) => {
    const value = e.target.value;
    setCustom(value);

    // custom 값이 있으면 선택된 키워드 초기화
    if (value.trim() !== '' && selected.length > 0) {
      setSelected([]);
    }

    // custom 값이 변경될 때마다 zustand 상태 업데이트
    setPersonality(value.trim() ? [value.trim()] : []);
  };

  return (
    <div className={styles.container}>
      {/* 콘텐츠 영역 */}
      <div className={styles.content}>
        <h2 className={styles.title}>
          고인의 어떤 점이
          <br />
          가장 기억에 남으시나요?
        </h2>

        {/* 입력창 */}
        <div className={styles.inputGroup} style={{ marginTop: '2rem' }}>
          <label
            className={`${styles.floatingLabel} ${
              focused || custom ? styles.visible : styles.hidden
            }`}
          >
            직접 입력
          </label>
          <input
            type="text"
            value={custom}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={handleCustomChange}
            className={styles.input}
            placeholder={!focused && !custom ? '예: 늘 따뜻한 말을 건네던' : ''}
            disabled={isInputDisabled}
          />
          {custom && (
            <button
              className={styles.clearButton}
              onClick={() => {
                setCustom('');
                setPersonality([...selected]);
              }}
            >
              ✕
            </button>
          )}
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
              } ${isKeywordDisabled ? styles.disabled : ''}`}
              onClick={() => toggleKeyword(word)}
              disabled={isKeywordDisabled}
            >
              {word}
            </button>
          ))}
        </div>
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
