import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDeceasedProfile from '../../redux/Store/useDeceasedProfile';
import { FaChevronDown } from 'react-icons/fa';
import styles from './Deceased.module.css';

export default function Step1_BasicInfo() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [showGenderOptions, setShowGenderOptions] = useState(false);

  const profile = useDeceasedProfile();
  console.log('[Zustand] Step1 전체 상태:', profile);

  const setDeceasedName = useDeceasedProfile((state) => state.setDeceasedName);
  const setGenderGlobal = useDeceasedProfile((state) => state.setGender);
  const setDeceasedAge = useDeceasedProfile((state) => state.setDeceasedAge);

  const navigate = useNavigate();

  const handleSubmit = () => {
    if (name.trim() && gender && age) {
      setDeceasedName(name.trim());
      setGenderGlobal(gender);
      setDeceasedAge(Number(age));
      navigate('/deceased/profile/step2');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>
          당신의 마음 속<br />
          고인을 소개해주세요.
        </h2>

        {/* 고인 성함 */}
        <div className={styles.inputGroup}>
          {(focusedField === 'name' || name) && (
            <label className={styles.floatingLabel}>고인 성함</label>
          )}
          <input
            type="text"
            value={name}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            placeholder={focusedField !== 'name' && !name ? '고인 성함' : ''}
          />
          {name && (
            <button className={styles.clearButton} onClick={() => setName('')}>
              ✕
            </button>
          )}
        </div>

        {/* 성별 */}
        {/* 성별 + 연세 한 줄 */}
        <div className={styles.rowGroup}>
          {/* 성별 */}
          <div className={styles.inputGroup}>
            {(focusedField === 'gender' || gender) && (
              <label className={styles.floatingLabel}>성별</label>
            )}
            <input
              type="text"
              value={gender === 'M' ? '남성' : gender === 'F' ? '여성' : ''}
              onFocus={() => {
                setFocusedField('gender');
                setShowGenderOptions(true);
              }}
              onBlur={() => setTimeout(() => setFocusedField(null), 150)}
              onClick={() => setShowGenderOptions((prev) => !prev)}
              readOnly
              className={styles.input}
              placeholder={focusedField !== 'gender' && !gender ? '성별' : ''}
            />
            <button
              className={styles.dropdownButton}
              onClick={() => setShowGenderOptions((prev) => !prev)}
              type="button"
            >
              <FaChevronDown />
            </button>
            {showGenderOptions && (
              <div className={styles.genderDropdown}>
                <div
                  onClick={() => {
                    setGender('M');
                    setShowGenderOptions(false);
                  }}
                >
                  남성
                </div>
                <div
                  onClick={() => {
                    setGender('F');
                    setShowGenderOptions(false);
                  }}
                >
                  여성
                </div>
              </div>
            )}
          </div>

          {/* 연세 */}
          <div className={styles.inputGroup}>
            {(focusedField === 'age' || age) && (
              <label className={styles.floatingLabel}>별세 연세</label>
            )}
            <input
              type="number"
              value={age}
              onFocus={() => setFocusedField('age')}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => setAge(e.target.value)}
              className={styles.input}
              placeholder={focusedField !== 'age' && !age ? '별세 연세' : ''}
            />
            {age && (
              <button className={styles.clearButton} onClick={() => setAge('')}>
                ✕
              </button>
            )}
          </div>
        </div>

        <p className={styles.helperText}>
          * 성별과 연세는 고인의 말투와 대화 방식에 반영됩니다.
        </p>
      </div>

      <button
        className={styles.confirmButton}
        onClick={handleSubmit}
        disabled={!name.trim() || !gender || !age}
      >
        다음
      </button>
    </div>
  );
}
