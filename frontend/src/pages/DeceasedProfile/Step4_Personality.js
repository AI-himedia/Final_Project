import { useState, useEffect, useRef } from 'react'; // useRef 추가
import { useNavigate } from 'react-router-dom';
import useDeceasedProfile from '../../zustand/useDeceasedProfile';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from './Deceased.module.css';

export default function Step4_Personality() {
  console.log('[zustand 전체 상태4]', useDeceasedProfile.getState());
  const navigate = useNavigate();

  const personality = useDeceasedProfile((state) => state.personality);
  const setPersonality = useDeceasedProfile((state) => state.setPersonality);

  const contentRef = useRef(null);
  const optionGroupRef = useRef(null);

  const [custom, setCustom] = useState('');
  const [selected, setSelected] = useState([]);
  const [focusedField, setFocusedField] = useState(null);

  // 키워드 카테고리 토글 상태
  const [showKeywords, setShowKeywords] = useState(true);

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
    '마지막까지 걱정하던', // 이 키워드가 길어서 문제를 일으킬 수 있습니다.
  ];

  const isKeywordDisabled = custom.trim() !== '';
  const isInputDisabled = selected.length >= 3;

  // 최초 로딩 시 personality 데이터 처리
  useEffect(() => {
    if (personality) {
      if (Array.isArray(personality)) {
        setSelected(personality);
      } else {
        setCustom(personality);
      }
    }
  }, []);

  useEffect(() => {
    if (custom.trim() !== '' || selected.length > 0) {
      if (custom.trim() !== '') {
        setPersonality(custom.trim());
      } else {
        setPersonality(selected);
      }
    }
  }, [custom, selected]);

  const toggleKeyword = (word) => {
    if (isKeywordDisabled) return;

    let updatedSelection = [...selected];
    if (updatedSelection.includes(word)) {
      updatedSelection = updatedSelection.filter((k) => k !== word);
    } else if (updatedSelection.length < 3) {
      updatedSelection.push(word);
    }

    setSelected(updatedSelection);
  };

  const handleCustomChange = (e) => {
    const value = e.target.value;
    setCustom(value);

    if (value.trim() !== '' && selected.length > 0) {
      setSelected([]);
    }
  };

  const clearCustomInput = () => {
    setCustom('');
  };

  const handleSubmit = () => {
    navigate('/deceased/profile/step5');
  };

  return (
    <div className={styles.container}>
      {/* content 영역에 ref 추가 */}
      <div className={styles.content} ref={contentRef}>
        <h2 className={styles.title}>
          고인의 어떤 점이
          <br />
          가장 기억에 남으시나요?
          <p className={styles.helperText}>
            이 성격은 고인의 말투와 대화 분위기에 반영돼요.
          </p>
        </h2>

        <div className={styles.inputGroup}>
          {(focusedField === 'custom' || custom) && (
            <label className={styles.floatingLabel}>직접 입력</label>
          )}

          <input
            type="text"
            value={custom}
            onFocus={() => setFocusedField('custom')}
            onBlur={() => setFocusedField(null)}
            onChange={handleCustomChange}
            className={styles.input}
            placeholder={focusedField !== 'custom' && !custom ? '직접입력' : ''}
            // placeholder={
            //   focusedField !== 'custom' && !custom
            //     ? selected.join(', ').slice(0, 30) +
            //       (selected.join(', ').length > 30 ? '...' : '')
            //     : '직접입력'
            // }
            disabled={isInputDisabled}
          />

          {custom && (
            <button className={styles.clearButton} onClick={clearCustomInput}>
              ✕
            </button>
          )}
        </div>

        <p className={styles.helperText}>
          * 직접 입력하거나, 최대 3개까지 키워드를 선택할 수 있어요.
        </p>

        <button
          type="button"
          className={styles.dropdownToggle}
          onClick={() => setShowKeywords((prev) => !prev)}
        >
          키워드 선택 {showKeywords ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {/* optionGroup 영역에 ref 추가 */}
        <div
          className={`${styles.optionWrapper} ${
            showKeywords ? styles.visible : ''
          }`}
        >
          <div className={styles.optionGroup} ref={optionGroupRef}>
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
      </div>

      <button
        className={styles.confirmButton}
        onClick={handleSubmit}
        // selected 또는 custom 값이 있어야 버튼 활성화
        disabled={selected.length === 0 && !custom.trim()}
      >
        다음
      </button>
    </div>
  );
}
