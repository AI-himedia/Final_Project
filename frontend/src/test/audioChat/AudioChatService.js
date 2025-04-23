// import React, { useRef, useState } from 'react';
// import { useAudioRecorder } from '../../hooks/useAudioRecorder';
// import { sendAudioToSpring } from '../../api/AudioApi';

// const AudioChatService = () => {
//   const { startRecording, stopRecording } = useAudioRecorder();
//   const audioRef = useRef(null);
//   const [isCalling, setIsCalling] = useState(false);
//   const [manualPlayRequired, setManualPlayRequired] = useState(false);
//   const [replyText, setReplyText] = useState('');
//   const [isTTSPlaying, setIsTTSPlaying] = useState(false);

//   const handleToggleCall = async () => {
//     if (isTTSPlaying) {
//       console.warn('TTS 재생 중. 마이크 정지');
//       return;
//     }

//     // 녹음 시작 + 자동 재생 권한 확보
//     if (!isCalling) {
//       console.log('[버튼] 통화 시작');
//       setIsCalling(true);

//       // 오디오 초기화
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current.currentTime = 0;
//         audioRef.current.src = '';
//       }

//       try {
//         await startRecording();
//         console.log('[Recorder] 사용자 발화 시작됨');
//       } catch (e) {
//         console.error('녹음 시작 실패:', e);
//         setIsCalling(false);
//       }
//     } else {
//       // 녹음 종료 + 서버 전송
//       console.log('[버튼] 통화 종료');
//       setIsCalling(false);

//       const audioBlob = await stopRecording();

//       if (!audioBlob || !(audioBlob instanceof Blob)) {
//         console.error('녹음된 오디오가 유효하지 않음. 전송 중단.');
//         return;
//       }

//       try {
//         const data = await sendAudioToSpring(audioBlob, 'SUBSCRIPTION_CODE');
//         setReplyText(data.text);

//         const audioBase64 = data.audio;
//         const binary = atob(audioBase64);
//         const bytes = new Uint8Array([...binary].map((c) => c.charCodeAt(0)));
//         const blob = new Blob([bytes], { type: 'audio/mpeg' });
//         const url = URL.createObjectURL(blob);

//         audioRef.current.src = url;
//         setIsTTSPlaying(true);

//         await audioRef.current.play().catch(() => {
//           setManualPlayRequired(true);
//         });

//         audioRef.current.onended = () => {
//           audioRef.current.src = '';
//           setIsTTSPlaying(false);
//         };
//       } catch (err) {
//         console.error('오디오 전송 실패:', err);
//         setIsTTSPlaying(false);
//       }
//     }
//   };

//   // TTS 수동재생
//   const handleManualPlay = async () => {
//     try {
//       await audioRef.current?.play();
//       setManualPlayRequired(false);
//     } catch (err) {
//       console.error('수동 재생도 실패:', err);
//     }
//   };

//   return (
//     <div>
//       <h2>오디오 메신저</h2>
//       <button onClick={handleToggleCall} disabled={isTTSPlaying}>
//         {isCalling ? '전송완료' : '전송시작'}
//       </button>

//       {replyText && <p>응답: {replyText}</p>}

//       <audio ref={audioRef} autoPlay />

//       {manualPlayRequired && (
//         <div>
//           <p>브라우저 정책으로 인해 자동 재생이 차단되었습니다.</p>
//           <button onClick={handleManualPlay}>오디오 수동 재생</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AudioChatService;
