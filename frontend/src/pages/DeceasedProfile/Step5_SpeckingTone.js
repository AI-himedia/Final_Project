import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDeceasedProfile from '../../zustand/useDeceasedProfile';
import './Deceased.module.css';

export default function Step5_SpeakingTone() {
  const navigate = useNavigate();

  const speakingTone = useDeceasedProfile((state) => state.speaking_tone);
  const setSpeakingTone = useDeceasedProfile((state) => state.setSpeakingTone);

  const [selectedTone, setSelectedTone] = useState(
    typeof speakingTone === 'boolean' ? speakingTone : null
  );

  const handleClick = (tone) => {
    if (selectedTone !== tone) {
      setSelectedTone(tone);
    }
  };

  const handleSubmit = () => {
    if (selectedTone !== null) {
      setSpeakingTone(selectedTone);
      navigate('/deceased/profile/step6');
    }
  };

  return (
    <div className="container">
      <div className="content">
        <h2 className="title">
          고인의 말은
          <br />
          어떤 스타일이었나요?
          <div className="helperText">
            반말은 친근한 느낌, 존댓말은 예의를 담은 표현이에요.
          </div>
        </h2>

        <div className="optionGroup">
          <button
            type="button"
            className={`optionButton ${
              selectedTone === true ? 'selected' : ''
            }`}
            onClick={() => handleClick(true)}
          >
            반말
          </button>
          <button
            type="button"
            className={`optionButton ${
              selectedTone === false ? 'selected' : ''
            }`}
            onClick={() => handleClick(false)}
          >
            존댓말
          </button>
        </div>
      </div>

      <button
        className="confirmButton"
        onClick={handleSubmit}
        disabled={selectedTone === null}
      >
        다음
      </button>
    </div>
  );
}
