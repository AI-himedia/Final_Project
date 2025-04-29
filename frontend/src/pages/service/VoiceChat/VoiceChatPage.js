import React, { useRef, useState, useEffect } from 'react';
import { useAudioRecorder } from '../../../hooks/useAudioRecorder';
import { AudioApi } from '../../../api/AudioApi';
import { FaRegStopCircle } from 'react-icons/fa';
import { MdKeyboardVoice } from 'react-icons/md';
import styles from './VoiceChatPage.module.css';
import { useLocation } from 'react-router-dom';
import { axiosInstance } from '../../../api/AxiosInstance';
import { useLoading } from '../../../contexts/LoadingContext';

const CallPage = () => {
  const { setIsLoading } = useLoading();
  const { startRecording, stopRecording } = useAudioRecorder();
  const audioRef = useRef(null);
  const [isCalling, setIsCalling] = useState(false);
  const [manualPlayRequired, setManualPlayRequired] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const location = useLocation();

  const initialSubscriptionCode = location.state?.subscriptionCode;
  const deceasedName = location.state?.deceasedName;
  const [currentSubscriptionCode, setCurrentSubscriptionCode] = useState(
    initialSubscriptionCode
  );

  useEffect(() => {
    if (currentSubscriptionCode) {
      const fetchEmbedding = async () => {
        try {
          setIsLoading(true);
          // const serviceCode = localStorage.getItem('@againhello/service-code');

          const response = await axiosInstance.post(
            `/embedding?subscription_code=${currentSubscriptionCode}&service_code=2`
          );

          console.log('Embedding 요청 성공:', response.data);
        } catch (error) {
          console.error('Embedding 요청 실패:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchEmbedding();
    }
  }, [currentSubscriptionCode]);

  useEffect(() => {
    // location.state의 subscriptionCode가 변경될 때 상태 업데이트
    if (location.state?.subscriptionCode !== currentSubscriptionCode) {
      setCurrentSubscriptionCode(location.state.subscriptionCode);
    }
    console.log(
      'CallPage useEffect - currentSubscriptionCode:',
      currentSubscriptionCode
    );
  }, [location.state?.subscriptionCode, currentSubscriptionCode]);

  const handleToggleCall = async () => {
    if (isTTSPlaying) {
      console.warn('TTS 재생 중. 마이크 정지');
      return;
    }

    // 녹음 시작
    if (!isCalling) {
      console.log('[버튼] 통화 시작');
      setIsCalling(true);

      // 오디오 초기화
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
      }

      try {
        await startRecording();
        console.log('[Recorder] 사용자 발화 시작됨');
      } catch (e) {
        console.error('녹음 시작 실패:', e);
        setIsCalling(false);
      }
    } else {
      // 녹음 종료 + 서버 전송
      console.log('[버튼] 통화 종료');
      setIsCalling(false);

      const audioBlob = await stopRecording();

      if (!audioBlob || !(audioBlob instanceof Blob)) {
        console.error('녹음된 오디오가 유효하지 않음. 전송 중단.');
        return;
      }

      try {
        setIsLoading(true);

        // AudioApi 함수 호출 시 currentSubscriptionCode 사용
        const data = await AudioApi(audioBlob, currentSubscriptionCode);
        setReplyText(data.text);

        const audioBase64 = data.audio;
        const binary = atob(audioBase64);
        const bytes = new Uint8Array([...binary].map((c) => c.charCodeAt(0)));
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);

        audioRef.current.src = url;
        setIsTTSPlaying(true);

        await audioRef.current.play().catch(() => {
          setManualPlayRequired(true);
        });

        audioRef.current.onended = () => {
          audioRef.current.src = '';
          setIsTTSPlaying(false);
        };
      } catch (err) {
        console.error('오디오 전송 실패:', err);
        setIsTTSPlaying(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // TTS 수동 재생
  const handleManualPlay = async () => {
    try {
      await audioRef.current?.play();
      setManualPlayRequired(false);
    } catch (err) {
      console.error('수동 재생도 실패:', err);
    }
  };

  return (
    <div className={styles.callPageContainer}>
      <div className={styles.topRightIcons}></div>
      <div className={styles.centralCircle}>
        <img
          src="https://raw.githubusercontent.com/AI-himedia/Final_Project_Assets/main/voice_chatting.png"
          alt="Call Interface"
          className={styles.centralCircleImage}
        />
      </div>
      <div className={styles.bottomControls}>
        <div
          className={styles.bottomLeft}
          onClick={handleToggleCall}
          disabled={isTTSPlaying}
        >
          {isCalling ? (
            <FaRegStopCircle size={28} color="#555" />
          ) : (
            <MdKeyboardVoice size={28} color="#555" />
          )}
        </div>
        <div className={styles.bottomRight}>
          {manualPlayRequired && (
            <button onClick={handleManualPlay}>수동 재생</button>
          )}
        </div>
      </div>
      {replyText && (
        <p className={styles.replyText}>
          故 {deceasedName}님: {replyText}
        </p>
      )}
      <audio ref={audioRef} autoPlay />
    </div>
  );
};

export default CallPage;
