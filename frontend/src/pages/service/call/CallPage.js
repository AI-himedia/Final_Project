import React, { useRef, useState, useEffect } from 'react';
import AudioSender from '../../../test/call/AudioSender';
import { setupMediaSource } from '../../../test/call/TTSStreamPlayer';
import styles from './CallPage.module.css';
import Swal from 'sweetalert2';

import { BiSolidUserVoice } from 'react-icons/bi';
import { MdKeyboardVoice } from 'react-icons/md';

const CallPage = () => {
  const { startAudioCapture, stopAudioCapture } = AudioSender();
  const [isCalling, setIsCalling] = useState(false);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const [manualPlayRequired, setManualPlayRequired] = useState(false);

  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);

  const webSocketUrl = 'ws://localhost:8080/be/ws/react';

  useEffect(() => {
    if (isCalling && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.warn('자동 재생 실패! 수동 재생 필요:', err);

        // SweetAlert2로 수동 재생 알림
        Swal.fire({
          position: 'top-end',
          icon: 'warning',
          title: '수동 재생이 필요합니다.',
          toast: true,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });

        setManualPlayRequired(true);
      });
    }
  }, [isCalling]);

  const startCall = async () => {
    socketRef.current = new WebSocket(webSocketUrl);
    socketRef.current.binaryType = 'arraybuffer';

    // TTS 실행 -> 사용자 Audio 다시 받기
    mediaSourceRef.current = setupMediaSource(
      audioRef,
      (sourceBufferRefFromSetup) => {
        sourceBufferRef.current = sourceBufferRefFromSetup.current;
        startAudioCapture(socketRef, false);
      }
    );

    // WebSocket 수신 처리
    socketRef.current.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        const msg = JSON.parse(event.data);

        if (msg.type === 'tts_start' || msg.type === 'stt_end') {
          console.log('TTS 시작 - 마이크 중단');
          await stopAudioCapture();
          setIsTTSPlaying(true);
        } else if (msg.type === 'tts_end') {
          console.log('TTS 종료 - 마이크 재시작 예정');
          setIsTTSPlaying(false);
          //  MediaSource 끝내기
          if (
            mediaSourceRef.current &&
            mediaSourceRef.current.readyState === 'open'
          ) {
            mediaSourceRef.current.endOfStream();
          }
          // 800ms 후 다시 마이크 캡처 시작
          setTimeout(() => startAudioCapture(socketRef, false), 800);
        }
      }
      // 바이너리 데이터 처리 (WebM chunk 수신)
      else if (
        event.data instanceof Blob ||
        event.data instanceof ArrayBuffer
      ) {
        // ArrayBuffer로 변환해서 appendBuffer에 추가
        const buffer =
          event.data instanceof Blob
            ? await event.data.arrayBuffer()
            : event.data;

        if (sourceBufferRef.current && !sourceBufferRef.current.updating) {
          try {
            sourceBufferRef.current.appendBuffer(buffer);
            console.log('appendBuffer 완료 (chunk 크기):', buffer.byteLength);
          } catch (e) {
            console.error('appendBuffer 오류:', e);
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
      setManualPlayRequired(false);
      console.log('수동 재생 성공');
    } catch (err) {
      console.error('수동 재생도 실패:', err);
    }
  };

  // 수동 재생 기능을 BiSolidUserVoice 아이콘에 옮기기
  const handleUserVoiceClick = () => {
    if (manualPlayRequired) {
      handleManualPlay();
    } else {
      handleToggleCall();
    }
  };

  return (
    <div className={styles.callPageContainer}>
      <div className={styles.topRightIcons}></div>
      <div className={styles.centralCircle}>
        <img
          src="/assets/voice_chatting.png"
          alt="Call Interface"
          className={styles.centralCircleImage}
        />
      </div>
      <div className={styles.bottomControls}>
        <div className={styles.bottomLeft} onClick={handleToggleCall}>
          <MdKeyboardVoice size={28} color="#555" />
        </div>
        <div className={styles.bottomRight}>
          {manualPlayRequired && (
            <BiSolidUserVoice
              size={24}
              color="#FF6347"
              onClick={handleUserVoiceClick}
            />
          )}
        </div>
      </div>
      <audio ref={audioRef} autoPlay />
    </div>
  );
};

export default CallPage;
