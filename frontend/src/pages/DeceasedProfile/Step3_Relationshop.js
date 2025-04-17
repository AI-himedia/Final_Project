import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDeceasedProfile from '../../redux/Store/useDeceasedProfile';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from './Deceased.module.css';

export default function Step3_Relationship() {
  const [relationship, setRelationshipLocal] = useState('');
  const [focused, setFocused] = useState(false);
  const [showFamily, setShowFamily] = useState(false);
  const [showSocial, setShowSocial] = useState(false);

  const setRelationship = useDeceasedProfile((state) => state.setRelationship);
  const profile = useDeceasedProfile();
  console.log('[Zustand] Step3 상태:', profile);

  const navigate = useNavigate();

  const handleSubmit = () => {
    if (relationship.trim()) {
      setRelationship(relationship.trim());
      navigate('/deceased/profile/step4');
    }
  };

  const familyOptions = [
    '어머니',
    '아버지',
    '할머니',
    '할아버지',
    '외할머니',
    '외할아버지',
    '형',
    '누나',
    '오빠',
    '동생',
    '고모',
    '이모',
    '삼촌',
    '자녀',
    '아들',
    '딸',
    '남편',
    '아내',
  ];

  const socialOptions = [
    '친구',
    '연인',
    '선생님',
    '스승',
    '제자',
    '동료',
    '상사',
    '멘토',
    '은인',
    '이웃',
    '가족 같은 사람',
    '나의 전부',
    '마음의 친구',
  ];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>
          고인과의
          <br />
          관계를 알려주세요.
        </h2>

        {/* 입력창 */}
        <div className={styles.inputGroup}>
          {(focused || relationship) && (
            <label className={styles.floatingLabel}>관계</label>
          )}
          <input
            type="text"
            value={relationship}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => setRelationshipLocal(e.target.value)}
            className={styles.input}
            placeholder={
              !focused && !relationship ? '예: 어머니, 친구, 선배' : ''
            }
          />
          {relationship && (
            <button
              className={styles.clearButton}
              onClick={() => setRelationshipLocal('')}
            >
              ✕
            </button>
          )}
        </div>
        <p className={styles.helperText}>
          * 고인과의 관계를 자유롭게 입력하거나 아래에서 선택할 수 있어요.
        </p>

        {/* 카테고리: 가족 관계 */}
        <button
          type="button"
          className={styles.dropdownToggle}
          onClick={() => setShowFamily((prev) => !prev)}
        >
          가족 관계 {showFamily ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {showFamily && (
          <div className={styles.optionGroup}>
            {familyOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`${styles.optionButton} ${
                  relationship === option ? styles.selected : ''
                }`}
                onClick={() => setRelationshipLocal(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* 카테고리: 사회적 관계 */}
        <button
          type="button"
          className={styles.dropdownToggle}
          onClick={() => setShowSocial((prev) => !prev)}
        >
          사회적 관계 {showSocial ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {showSocial && (
          <div className={styles.optionGroup}>
            {socialOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`${styles.optionButton} ${
                  relationship === option ? styles.selected : ''
                }`}
                onClick={() => setRelationshipLocal(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        className={styles.confirmButton}
        onClick={handleSubmit}
        disabled={!relationship.trim()}
      >
        확인
      </button>
    </div>
  );
}
