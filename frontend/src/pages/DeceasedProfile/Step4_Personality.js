import { useState, useEffect, useRef } from 'react'; // useRef 추가
import { useNavigate } from 'react-router-dom';
import useDeceasedProfile from '../../zustand/useDeceasedProfile';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from './Deceased.module.css';

export default function Step4_Personality() {
  const navigate = useNavigate();

  const personality = useDeceasedProfile((state) => state.personality);
  const setPersonality = useDeceasedProfile((state) => state.setPersonality);

  const contentRef = useRef(null);
  const optionGroupRef = useRef(null);

  // const [focused, setFocused] = useState(false); // 이 상태는 현재 사용되지 않는 것 같습니다. 제거해도 될 수 있습니다.
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
    console.log('[Step4] 최초 personality 값:', personality);

    if (typeof personality === 'string' && personality.trim() !== '') {
      if (keywords.includes(personality)) {
        setSelected([personality]);
      } else {
        setCustom(personality);
      }
    } else if (Array.isArray(personality) && personality.length > 0) {
      const keywordItems = personality.filter((p) => keywords.includes(p));
      setSelected(keywordItems);
      const nonKeywordItem = personality.find((p) => !keywords.includes(p));
      if (nonKeywordItem) {
        setCustom(nonKeywordItem);
      }
    }
  }, []); // 최초 마운트 시에만 실행되도록 빈 배열 전달

  // 상태 변경 시 로그 출력 및 Zustand 업데이트 로직 통합
  useEffect(() => {
    const merged = custom.trim() ? [...selected, custom.trim()] : [...selected];
    // personality 상태가 실제로 변경되었을 때만 zustand 업데이트 호출 (무한 루프 방지)
    const currentPersonality = useDeceasedProfile.getState().personality;
    if (JSON.stringify(merged) !== JSON.stringify(currentPersonality)) {
      console.log('[Step4] Zustand 상태 업데이트:', merged);
      setPersonality(merged);
    }

    // 요소 크기 로깅 (요소가 렌더링 된 후)
    if (contentRef.current) {
      console.log(
        `[Step4] contentRef 크기: width=${contentRef.current.offsetWidth}, height=${contentRef.current.offsetHeight}, scrollWidth=${contentRef.current.scrollWidth}, scrollHeight=${contentRef.current.scrollHeight}`
      );
    }
    if (optionGroupRef.current) {
      console.log(
        `[Step4] optionGroupRef 크기: width=${optionGroupRef.current.offsetWidth}, height=${optionGroupRef.current.offsetHeight}, scrollWidth=${optionGroupRef.current.scrollWidth}, scrollHeight=${optionGroupRef.current.scrollHeight}`
      );
    }
    // window 크기도 함께 로깅하면 비교에 도움됨
    console.log(
      `[Step4] Window 크기: width=${window.innerWidth}, height=${window.innerHeight}`
    );
  }, [selected, custom, showKeywords, setPersonality]); // selected, custom, showKeywords 변경 시 로그 재실행 및 상태 업데이트

  const toggleKeyword = (word) => {
    if (isKeywordDisabled) return;

    let updatedSelection = [...selected];
    if (updatedSelection.includes(word)) {
      updatedSelection = updatedSelection.filter((k) => k !== word);
    } else if (updatedSelection.length < 3) {
      updatedSelection.push(word);
    }

    setSelected(updatedSelection); // selected 상태 업데이트
    // Zustand 업데이트는 useEffect에서 처리
  };

  const handleCustomChange = (e) => {
    const value = e.target.value;
    setCustom(value);

    if (value.trim() !== '' && selected.length > 0) {
      setSelected([]); // custom 입력 시 selected 초기화
    }
    // Zustand 업데이트는 useEffect에서 처리
  };

  const clearCustomInput = () => {
    setCustom('');
    // Zustand 업데이트는 useEffect에서 처리
  };

  const handleSubmit = () => {
    // 최종 상태는 useEffect에서 이미 setPersonality로 반영되었을 것이므로 여기서는 네비게이션만 처리
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
            // --- Placeholder 수정 제안 ---
            // 기존 로직 대신 단순 텍스트로 변경하여 테스트
            placeholder={focusedField !== 'custom' && !custom ? '직접입력' : ''}
            // --- 원래 Placeholder (참고용) ---
            // placeholder={
            //   focusedField !== 'custom' && !custom
            //     ? selected.join(', ').slice(0, 30) +
            //       (selected.join(', ').length > 30 ? '...' : '')
            //     : '직접입력'
            // }
            disabled={isInputDisabled}
          />

          {custom && (
            <button
              className={styles.clearButton}
              onClick={clearCustomInput} // clearCustomInput 함수 사용
            >
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
