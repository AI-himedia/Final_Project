import { useState, useEffect, useRef } from 'react';
import { API_SERVER_HOST } from '../../config/ApiConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import useDeceasedProfile from '../../zustand/useDeceasedProfile';
import styles from './Deceased.module.css';
import { CiPause1 } from 'react-icons/ci';
import { CiPlay1 } from 'react-icons/ci';
import { axiosInstance } from '../../api/AxiosInstance';

export default function Step7_Call() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const previewData = state?.previewData;
  const { subscription_Code } = useDeceasedProfile((state) => state);

  const [playingStatus, setPlayingStatus] = useState({});
  const [progress, setProgress] = useState({});
  const [selectedSpeakerIndex, setSelectedSpeakerIndex] = useState(null);
  const [selectedSpeakers, setSelectedSpeakers] = useState([]); // 선택된 화자 관리
  const audioRefs = useRef([]);

  useEffect(() => {
    if (previewData) {
      console.log('화자 분리 결과:', previewData);
      if (previewData.speakersByFile) {
        Object.entries(previewData.speakersByFile).forEach(
          ([filename, speakers]) => {
            speakers.forEach((speaker) => {
              console.log(
                `파일: ${filename}, 화자: ${speaker.displayName}, 경로: ${speaker.filePath}`
              );
            });
          }
        );
      }
    }
  }, [previewData]);

  const handlePlayPause = (index, e) => {
    e.stopPropagation(); // 버튼 클릭 시 부모 클릭 이벤트 전파 방지
    if (audioRefs.current[index].paused) {
      audioRefs.current[index].play();
      setPlayingStatus((prevState) => ({
        ...prevState,
        [index]: true,
      }));
    } else {
      audioRefs.current[index].pause();
      setPlayingStatus((prevState) => ({
        ...prevState,
        [index]: false,
      }));
    }
  };

  const handleTimeUpdate = (index) => {
    const progressValue =
      (audioRefs.current[index].currentTime /
        audioRefs.current[index].duration) *
      100;
    setProgress((prevState) => ({
      ...prevState,
      [index]: progressValue,
    }));
  };

  const handleSpeakerSelect = (index, speakerId, originalFilename) => {
    // 선택된 화자를 배열에 추가하거나 제거
    setSelectedSpeakers((prevSelectedSpeakers) => {
      const isSelected = prevSelectedSpeakers.some(
        (speaker) => speaker.selectedSpeakerId === speakerId
      );
      if (isSelected) {
        // 이미 선택된 화자라면 제거
        return prevSelectedSpeakers.filter(
          (speaker) => speaker.selectedSpeakerId !== speakerId
        );
      } else {
        // 새로운 화자 선택
        return [
          ...prevSelectedSpeakers,
          { originalFilename, selectedSpeakerId: speakerId },
        ];
      }
    });
  };

  const handleAudioSuccess = (filePath) => {
    console.log(`오디오 로드 성공: ${filePath}`);
  };

  const handleCreateConversation = async () => {
    if (selectedSpeakers.length === 0) {
      alert('화자를 선택해주세요!');
      return;
    }

    const requestData = {
      subscriptionCode: Number(subscription_Code),
      selections: selectedSpeakers,
    };

    // POST 요청 전에 로그 출력
    console.log('전송할 데이터:', requestData);

    try {
      const response = await axiosInstance.post(
        '/call/save/selected-speakers',
        requestData
      );
      // 성공적으로 요청을 보낸 후
      console.log('대화 만들기 성공:', response.data);
      navigate('/deceased/chat/setup'); // 대화 설정 페이지로 이동
    } catch (error) {
      console.error('오류 발생:', error);
      alert('서버 요청 중 오류가 발생했습니다.');
    }
  };

  if (!previewData) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>
          결과 데이터를 찾을 수 없습니다. 이전 단계로 돌아가 다시 시도해주세요.
        </p>
        <button onClick={() => navigate('/deceased/profile/step6')}>
          돌아가기
        </button>
      </div>
    );
  }

  const { speakersByFile } = previewData;

  return (
    <div className={styles.container}>
      <h2 className={styles.title} style={{ marginBottom: '2rem' }}>
        화자 분리 결과를 확인하고
        <br />
        원하는 화자를 선택해보세요!
        <p className={styles.helperText}>
          화자 분리된 음성을 확인하고, 필요한 부분을 선택할 수 있습니다.
        </p>
      </h2>

      {Object.entries(speakersByFile).map(([originalFilename, speakers]) => (
        <div key={originalFilename} className={styles.audioGroup}>
          {speakers.map((speaker, idx) => (
            <div
              key={idx}
              className={`${styles.audioItem} ${
                selectedSpeakers.some(
                  (item) => item.selectedSpeakerId === speaker.speakerId
                )
                  ? styles.selected
                  : ''
              }`}
              onClick={() =>
                handleSpeakerSelect(
                  speaker.speakerId,
                  speaker.speakerId,
                  originalFilename
                )
              }
            >
              <p className={styles.audioLabel}>{speaker.displayName}</p>

              {/* 커스텀 오디오 플레이어 */}
              <div className={styles.audioPlayerWrapper}>
                <button
                  className={styles.playPauseButton}
                  onClick={(e) => handlePlayPause(idx, e)} // 클릭 이벤트 전파 방지
                >
                  {playingStatus[idx] ? (
                    <CiPause1 style={{ color: '#fff' }} />
                  ) : (
                    <CiPlay1 style={{ color: '#fff' }} />
                  )}
                </button>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progress}
                    style={{ width: `${progress[idx] || 0}%` }}
                  ></div>
                </div>
                <p className={styles.time}>
                  {Math.floor(
                    audioRefs.current[idx]
                      ? audioRefs.current[idx].currentTime
                      : 0
                  )}{' '}
                  /
                  {Math.floor(
                    audioRefs.current[idx] ? audioRefs.current[idx].duration : 0
                  )}{' '}
                  sec
                </p>
                <audio
                  ref={(el) => (audioRefs.current[idx] = el)}
                  src={`${API_SERVER_HOST}/be/call/audio-direct?path=${encodeURIComponent(
                    speaker.filePath
                  )}&subscriptionCode=${subscription_Code}`}
                  onLoadedData={() => handleAudioSuccess(speaker.filePath)}
                  onTimeUpdate={() => handleTimeUpdate(idx)}
                ></audio>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className={styles.confirmButtonWrapper}>
        <button
          className={styles.confirmButton}
          onClick={handleCreateConversation}
          disabled={selectedSpeakers.length === 0}
        >
          대화 만들기 시작
        </button>
      </div>
    </div>
  );
}
