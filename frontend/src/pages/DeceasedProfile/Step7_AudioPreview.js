import { useState, useEffect, useRef } from 'react';
import { API_SERVER_HOST } from '../../config/ApiConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import useDeceasedProfile from '../../zustand/useDeceasedProfile';
import styles from './Deceased.module.css';
import { FaPause } from 'react-icons/fa';
import { FaPlay } from 'react-icons/fa';
import { axiosInstance } from '../../api/AxiosInstance';
import { Toast } from '../../utils/Swal';
import { useLoading } from '../../contexts/LoadingContext';

export default function Step7_Call() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const previewData = state?.previewData;
  const { subscriptionCode } = useDeceasedProfile();

  const [playingStatus, setPlayingStatus] = useState({});
  const [progress, setProgress] = useState({});
  const [selectedSpeakers, setSelectedSpeakers] = useState([]);
  const audioRefs = useRef({});
  const [durations, setDurations] = useState({});
  const { setIsLoading } = useLoading();

  useEffect(() => {
    setDurations((prevDurations) => {
      const newDurations = { ...prevDurations };
      Object.entries(previewData.speakersByFile).forEach(
        ([filename, speakers]) => {
          speakers.forEach((speaker) => {
            newDurations[`${filename}-${speaker.speakerId}`] = 0;
          });
        }
      );
      return newDurations;
    });
  }, [previewData]);

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

  // 오디오 재생/일시정지 처리
  const handlePlayPause = (originalFilename, speakerId, idx, e) => {
    e.stopPropagation();
    const audioKey = `${originalFilename}-${speakerId}`;
    const audioElement = audioRefs.current[audioKey];

    console.log(`handlePlayPause 호출: ${audioKey}`, audioElement);

    if (!audioElement) {
      console.log(`오디오 요소가 존재하지 않습니다: ${audioKey}`);
      return;
    }

    const key = `${originalFilename}-${speakerId}`;

    setPlayingStatus((prevState) => {
      const isPlaying = prevState[key];
      if (isPlaying) {
        audioElement.pause();
        console.log(`오디오 일시 정지: ${audioKey}`);
        return { ...prevState, [key]: false };
      } else {
        audioElement
          .play()
          .catch((error) => console.error('Play error:', error));
        console.log(`오디오 재생 시작: ${audioKey}`);
        return { ...prevState, [key]: true };
      }
    });
  };

  // 오디오 진행 상태 업데이트
  const handleTimeUpdate = (originalFilename, speakerId, idx) => {
    const audioKey = `${originalFilename}-${speakerId}`;
    const audio = audioRefs.current[audioKey];
    const duration = durations[audioKey];

    console.log(`handleTimeUpdate 호출: ${audioKey}`, audio, duration);

    if (!audio || isNaN(duration) || !isFinite(duration) || duration <= 0) {
      console.log(`유효하지 않은 duration 값 또는 audio 참조: ${audioKey}`);
      return;
    }

    requestAnimationFrame(() => {
      const progressValue = (audio.currentTime / duration) * 100;
      setProgress((prevState) => ({
        ...prevState,
        [audioKey]: progressValue,
      }));
    });
  };

  // 오디오 메타데이터 로딩 후 처리
  const onLoadedMetadataHandler = (index, originalFilename, speakerId) => {
    const audioKey = `${originalFilename}-${speakerId}`;
    const audio = audioRefs.current[audioKey];

    console.log(`onLoadedMetadataHandler 호출: ${audioKey}`, audio);

    if (audio) {
      let duration = audio.duration;
      console.log(`오디오 로드 시 duration 값: ${duration} (${audioKey})`);

      if (isNaN(duration) || !isFinite(duration) || duration === Infinity) {
        duration = 0;
        console.log(`유효하지 않은 duration 값 처리, 0으로 설정: ${audioKey}`);
      }

      setDurations((prevDurations) => ({
        ...prevDurations,
        [audioKey]: duration,
      }));
    } else {
      console.log(`audioRefs에서 ${audioKey} 참조가 없습니다.`);
    }
  };

  // 오디오 로드 성공시 처리
  const handleAudioSuccess = (filePath) => {
    console.log(`오디오 로드 성공: ${filePath}`);
  };

  // 화자 선택시 처리
  const handleSpeakerSelect = (idx, speakerId, originalFilename) => {
    setSelectedSpeakers((prevSelectedSpeakers) => {
      const isSelected = prevSelectedSpeakers.some(
        (speaker) =>
          speaker.selectedSpeakerId === speakerId &&
          speaker.originalFilename === originalFilename
      );

      const updatedSpeakers = isSelected
        ? prevSelectedSpeakers.filter(
            (speaker) =>
              speaker.selectedSpeakerId !== speakerId ||
              speaker.originalFilename !== originalFilename
          )
        : [
            ...prevSelectedSpeakers,
            { originalFilename, selectedSpeakerId: speakerId },
          ];

      return updatedSpeakers;
    });
  };

  // 대화 만들기 시작
  const handleCreateConversation = async () => {
    if (selectedSpeakers.length === 0) {
      Toast.fire({
        icon: 'warning',
        title: '화자를 선택해주세요!',
      });
      return;
    }

    const requestData = {
      subscriptionCode: Number(subscriptionCode),
      serviceCode: localStorage.getItem('@againhello/service-code'),
      selections: selectedSpeakers,
    };

    console.log('전송할 데이터:', requestData);

    try {
      setIsLoading(true);

      const response = await axiosInstance.post(
        '/call/save/selected-speakers',
        requestData
      );
      console.log('대화 만들기 성공:', response.data);
      navigate('/');
    } catch (error) {
      console.error('오류 발생:', error);
      Toast.fire({
        icon: 'warning',
        title: '서버 요청 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);

      Toast.fire({
        icon: 'success',
        title: '프로필 저장이 완료되었습니다!',
      });
    }
  };

  // 각 오디오 요소를 고유하게 관리하는 부분에서의 로그 확인
  useEffect(() => {
    console.log('현재 audioRefs:', audioRefs.current);
  }, [audioRefs.current]);

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
                    selected.selectedSpeakerId === speaker.speakerId &&
                    selected.originalFilename === originalFilename
                )
                  ? styles.selected
                  : ''
              }`}
              onClick={() =>
                handleSpeakerSelect(idx, speaker.speakerId, originalFilename)
              }
            >
              <div className={styles.audioContainer}>
                <button
                  className={styles.playPauseButton}
                  onClick={(e) =>
                    handlePlayPause(originalFilename, speaker.speakerId, idx, e)
                  }
                >
                  {playingStatus[`${originalFilename}-${speaker.speakerId}`] ? (
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
                    style={{
                      width: `${
                        progress[`${originalFilename}-${speaker.speakerId}`] ||
                        0
                      }%`,
                    }}
                  ></div>
                </div>
                <p className={styles.time}>
                  {Math.floor(
                    audioRefs.current[
                      `${originalFilename}-${speaker.speakerId}`
                    ]
                      ? audioRefs.current[
                          `${originalFilename}-${speaker.speakerId}`
                        ].currentTime
                      : 0
                  )}{' '}
                  :{' '}
                  {Math.floor(
                    durations[`${originalFilename}-${speaker.speakerId}`] || 0
                  )}
                </p>
              </div>

              <p className={styles.fileSize}>
                {speaker.fileSize && `파일 크기: ${speaker.fileSize}`}
              </p>

              <audio
                key={`${originalFilename}-${speaker.displayName}-audio`}
                ref={(el) => {
                  audioRefs.current[
                    `${originalFilename}-${speaker.speakerId}`
                  ] = el;
                }}
                src={`${API_SERVER_HOST}/be/call/audio-direct?path=${encodeURIComponent(
                  speaker.filePath
                )}&subscriptionCode=${subscriptionCode}`}
                onLoadedData={() => handleAudioSuccess(speaker.filePath)}
                onTimeUpdate={() =>
                  handleTimeUpdate(originalFilename, speaker.speakerId, idx)
                }
                onLoadedMetadata={() =>
                  onLoadedMetadataHandler(
                    idx,
                    originalFilename,
                    speaker.speakerId
                  )
                }
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
          프로필 저장하기
        </button>
      </div>
    </div>
  );
}
