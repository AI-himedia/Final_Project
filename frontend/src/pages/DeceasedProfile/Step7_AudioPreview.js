import { useState, useEffect, useRef } from 'react';
import { API_SERVER_HOST } from '../../config/ApiConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import useDeceasedProfile from '../../zustand/useDeceasedProfile';
import styles from './Deceased.module.css';
import { FaPause } from 'react-icons/fa';
import { FaPlay } from 'react-icons/fa';
import { axiosInstance } from '../../api/AxiosInstance';

export default function Step7_Call() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const previewData = state?.previewData;
  const { subscription_Code } = useDeceasedProfile((state) => state);

  const [playingStatus, setPlayingStatus] = useState({});
  const [progress, setProgress] = useState({});
  const [selectedSpeakers, setSelectedSpeakers] = useState([]);
  const audioRefs = useRef([]);
  const [durations, setDurations] = useState({});

  useEffect(() => {
    if (previewData && previewData.speakersByFile) {
      const initialDurations = {};
      Object.values(previewData.speakersByFile)
        .flat()
        .forEach((_, index) => {
          initialDurations[index] = 0;
        });
      setDurations(initialDurations);

      console.log('화자 분리 결과:', previewData);
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
  }, [previewData]);

  const handlePlayPause = (index, e) => {
    e.stopPropagation();
    const audioElement = audioRefs.current[index];
    if (!audioElement) return;

    setPlayingStatus((prevState) => {
      const isPlaying = !!prevState[index];
      if (isPlaying) {
        audioElement.pause();
        return { ...prevState, [index]: false };
      } else {
        audioElement
          .play()
          .catch((error) => console.error('Play error:', error));
        return { ...prevState, [index]: true };
      }
    });
  };

  const handleTimeUpdate = (index) => {
    const audio = audioRefs.current[index];
    const duration = durations[index];

    if (!audio || isNaN(duration) || !isFinite(duration) || duration <= 0) {
      return;
    }

    requestAnimationFrame(() => {
      console.log(
        `currentTime in RAF: ${audio.currentTime}, duration: ${duration}`
      );
      const progressValue = (audio.currentTime / duration) * 100;
      setProgress((prevState) => ({ ...prevState, [index]: progressValue }));
    });
  };

  const handleSpeakerSelect = (index, speakerId, originalFilename) => {
    setSelectedSpeakers((prevSelectedSpeakers) => {
      const isSelected = prevSelectedSpeakers.some(
        (speaker) => speaker.selectedSpeakerId === speakerId
      );
      if (isSelected) {
        return prevSelectedSpeakers.filter(
          (speaker) => speaker.selectedSpeakerId !== speakerId
        );
      } else {
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

    console.log('전송할 데이터:', requestData);

    try {
      const response = await axiosInstance.post(
        '/call/save/selected-speakers',
        requestData
      );
      console.log('대화 만들기 성공:', response.data);
      // navigate('/deceased/chat/setup');
    } catch (error) {
      console.error('오류 발생:', error);
      alert('서버 요청 중 오류가 발생했습니다.');
    }
  };

  const onLoadedMetadataHandler = (index) => {
    console.log(`[${index}] onLoadedMetadata triggered`);
    const audio = audioRefs.current[index];
    if (audio) {
      let duration = audio.duration;
      console.log(`[${index}] Initial duration from metadata:`, duration);
      if (isNaN(duration) || !isFinite(duration) || duration === Infinity) {
        console.log(`[${index}] Invalid duration, setting to 0`);
        duration = 0;
      }
      setDurations((prevDurations) => ({
        ...prevDurations,
        [index]: duration,
      }));
      console.log(`[${index}] durations state:`, durations);
    } else {
      console.log(`[${index}] audioRef is null in onLoadedMetadata`);
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
              key={`${originalFilename}-${speaker.displayName}`}
              className={`${styles.audioItem} ${
                selectedSpeakers.some(
                  (selected) =>
                    selected.selectedSpeakerId === speaker.displayName
                )
                  ? styles.selected
                  : ''
              }`}
              onClick={() =>
                handleSpeakerSelect(idx, speaker.displayName, originalFilename)
              }
            >
              <div className={styles.audioContainer}>
                <button
                  className={styles.playPauseButton}
                  onClick={(e) => handlePlayPause(idx, e)}
                >
                  {playingStatus[idx] ? (
                    <FaPause style={{ fontSize: '1.1rem' }} />
                  ) : (
                    <FaPlay
                      style={{ fontSize: '1.2rem', paddingLeft: '4px' }}
                    />
                  )}
                </button>
                <div className={styles.audioLabelWrapper}>
                  <p className={styles.audioLabel}>{speaker.displayName}</p>
                  <span className={styles.filename}>
                    {originalFilename.split('.').length > 1
                      ? originalFilename.split('.').slice(0, -1).join('.')
                      : originalFilename}
                  </span>
                </div>
              </div>

              <div className={styles.playPauseButtonWrapper}>
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
                  : {Math.floor(durations[idx] || 0)}{' '}
                </p>
              </div>

              <p className={styles.fileSize}>
                {speaker.fileSize && `파일 크기: ${speaker.fileSize}`}
              </p>

              <audio
                key={`${originalFilename}-${speaker.displayName}-audio`}
                ref={(el) => (audioRefs.current[idx] = el)}
                src={`${API_SERVER_HOST}/be/call/audio-direct?path=${encodeURIComponent(
                  speaker.filePath
                )}&subscriptionCode=${subscription_Code}`}
                onLoadedData={() => handleAudioSuccess(speaker.filePath)}
                onTimeUpdate={() => handleTimeUpdate(idx)}
                onLoadedMetadata={() => onLoadedMetadataHandler(idx)}
              ></audio>
              <div className={styles.audioPlayerWrapper}></div>
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
