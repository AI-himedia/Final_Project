import React, { useRef, useState, useEffect } from 'react';
import AudioSender from './AudioSender';
import { setupMediaSource } from './TTSStreamPlayer';
import { useLocation } from 'react-router-dom';
import { axiosInstance } from '../../../api/AxiosInstance';
import { MdCall } from 'react-icons/md';
import { MdCallEnd } from 'react-icons/md';
import styles from '../VoiceChat/VoiceChatPage.module.css';

const CallPage = () => {
  const { startAudioCapture, stopAudioCapture } = AudioSender();
  const [isCalling, setIsCalling] = useState(false);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const [manualPlayRequired, setManualPlayRequired] = useState(false);

  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);
  const appendQueueRef = useRef([]);

  const micStartTimeRef = useRef(null);

  // const webSocketUrl = "ws://localhost:8080/be/ws/react?subscriptionCode=${currentSubscriptionCode}"

  // ---- !!!! 준호씨 일단 제가 CallPage.js 에 있는 SubscriptionCode 가져오는 코드 그대로 긁어왔어요.
  const location = useLocation();
  const initialSubscriptionCode = location.state?.subscriptionCode;
  const [currentSubscriptionCode, setCurrentSubscriptionCode] = useState(
    initialSubscriptionCode
  );

  const webSocketUrl = `wss://againhello.site/be/ws/react?subscriptionCode=${currentSubscriptionCode}`;

  useEffect(() => {
    if (currentSubscriptionCode) {
      const fetchEmbedding = async () => {
        try {
          const serviceCode = localStorage.getItem('@againhello/service-code');

          const response = await axiosInstance.post(
            `/embedding?subscription_code=${currentSubscriptionCode}&service_code=${serviceCode}`
          );

          console.log('Embedding 요청 성공:', response.data);
        } catch (error) {
          console.error('Embedding 요청 실패:', error);
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
      'CallService useEffect - currentSubscriptionCode:',
      currentSubscriptionCode
    );
  }, [location.state?.subscriptionCode, currentSubscriptionCode]);
  // ----------여기까지 긁어옴!

  const initMediaSource = () => {
    setupMediaSource(audioRef, (sourceBufferRefFromSetup, mediaSource) => {
      sourceBufferRef.current = sourceBufferRefFromSetup.current;
      mediaSourceRef.current = mediaSource;

      const tryAppendBuffer = () => {
        console.log('[SourceBuffer] 생성됨:', mediaSource.readyState);

        const queue = appendQueueRef.current;
        if (
          !sourceBufferRef.current ||
          !mediaSourceRef.current ||
          mediaSourceRef.current.readyState !== 'open' ||
          sourceBufferRef.current.updating
        )
          return;

        if (queue.length > 0) {
          const nextBuffer = queue.shift();
          try {
            sourceBufferRef.current.appendBuffer(nextBuffer);
          } catch (e) {
            console.warn('appendBuffer 실패:', e);
          }
        }
      };

      sourceBufferRef.current.addEventListener('updateend', () => {
        console.log('[updateend] 이벤트 발생');
        tryAppendBuffer();

        const queue = appendQueueRef.current;
        if (queue.length === 0 && !sourceBufferRef.current.updating) {
          console.log('재생 직전 상태 확인');
          console.log('audio.readyState:', audioRef.current.readyState);
          console.log(
            'mediaSource.readyState:',
            mediaSourceRef.current?.readyState
          );
          console.log(
            'sourceBuffer.updating:',
            sourceBufferRef.current?.updating
          );

          setTimeout(() => {
            console.log(
              '[React] 재생 시도 직전 readyState:',
              audioRef.current.readyState
            );

            if (audioRef.current.readyState === 0) {
              console.warn('[재생 실패] 오디오 준비 안 됨');
              setManualPlayRequired(true);
              return;
            }
            audioRef.current.onplay = () => {
              const now = performance.now();
              const elapsed = (now - micStartTimeRef.current).toFixed(2);
              console.log(`[재생 시점] 실제 재생까지 소요 시간: ${elapsed}ms`);
            };
            audioRef.current.play().catch((e) => {
              console.warn('[재생] 자동 재생 실패 → 수동 필요:', e);
              setManualPlayRequired(true);
            });
          }, 50);
        }
      });

      sourceBufferRef.current.addEventListener('error', (e) =>
        console.error('SourceBuffer 에러 발생:', e)
      );
    });
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        console.log('오디오 재생 완료됨');
        setIsTTSPlaying(false);

        // setTimeout(() => {
        //   console.log("발화 재시작");
        //   startAudioCapture(socketRef, false);
        // }, 500);
      };
    }
  }, [audioRef.current]);

  const startCall = async () => {
    socketRef.current = new WebSocket(webSocketUrl);
    socketRef.current.binaryType = 'arraybuffer';

    socketRef.current.onopen = () => {
      console.log('[WebSocket] 연결 완료됨');
    };

    socketRef.current.onclose = (e) => {
      console.warn('[WebSocket] 연결 종료됨:', e);
    };

    socketRef.current.onerror = (e) => {
      console.error('[WebSocket] 오류 발생:', e);
    };

    // TTS 실행 -> 사용자 Audio 다시 받기
    initMediaSource();
    micStartTimeRef.current = performance.now();
    startAudioCapture(socketRef, false);

    // WebSocket 수신 처리
    socketRef.current.onmessage = async (event) => {
      console.log('[React 수신 원본]:', event.data);

      if (typeof event.data === 'string') {
        const msg = JSON.parse(event.data);

        if (msg.type === 'stt_end') {
          console.log('마이크 중단');

          await stopAudioCapture();
          setIsTTSPlaying(true);

          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
          }
          appendQueueRef.current = [];

          initMediaSource();
        } else if (msg.type === 'tts_end') {
          console.log('TTS 수신 완료. 마이크 오픈');
          setTimeout(() => {
            console.log('발화 재시작');
            startAudioCapture(socketRef, false);
          }, 500);
        }
      } else if (
        event.data instanceof Blob ||
        event.data instanceof ArrayBuffer
      ) {
        const buffer =
          event.data instanceof Blob
            ? await event.data.arrayBuffer()
            : event.data;
        const queue = appendQueueRef.current;
        queue.push(buffer);

        if (
          sourceBufferRef.current &&
          mediaSourceRef.current &&
          mediaSourceRef.current.readyState === 'open' &&
          !sourceBufferRef.current.updating
        ) {
          const nextBuffer = queue.shift();
          if (nextBuffer) {
            try {
              sourceBufferRef.current.appendBuffer(nextBuffer);
              console.log(
                '[React] appendBuffer 실행됨, 크기:',
                nextBuffer.byteLength
              );
            } catch (e) {
              console.warn('appendBuffer 에러 발생:', e);
            }
          }
        }
      }
    };
    setIsCalling(true);
  };

  // 통화 종료 - 마이크/AudioContext 정지, WebSocket 닫기
  const endCall = async () => {
    await stopAudioCapture();
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }
    setIsCalling(false);
  };

  const handleToggleCall = () => {
    if (!isCalling) {
      startCall();
    } else {
      endCall();
    }
  };

  // 수동 재생 버튼
  const handleManualPlay = async () => {
    try {
      await audioRef.current?.play();
      setManualPlayRequired(false); // 성공 시 버튼 숨김
      console.log('수동 재생 성공');
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
        <button className={styles.bottomLeft} onClick={handleToggleCall}>
          {isCalling ? (
            <MdCallEnd size={28} color="#555" />
          ) : (
            <MdCall size={28} color="#555" />
          )}
        </button>
        <audio ref={audioRef} autoPlay />
        {manualPlayRequired && (
          <div className={styles.bottomRight}>
            <p>브라우저 정책으로 인해 자동 재생이 차단되었습니다.</p>
            <button onClick={handleManualPlay}>수동 재생</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallPage;
