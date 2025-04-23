import { useRef } from 'react';
import RecordRTC from 'recordrtc';

/**
 * 플랫폼 감지: iPhone, iPad, iPadOS까지 대응
 */
const isIOS = () => {
  const ua = navigator.userAgent;
  const isIOSDevice = /iPhone|iPad|iPod/.test(ua);
  const isIPadOS = ua.includes('Macintosh') && 'ontouchend' in document;
  return isIOSDevice || isIPadOS;
};

/**
 * React 훅: 오디오 녹음 기능 (MediaRecorder + RecordRTC fallback)
 */
export function useAudioRecorder() {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const IS_IOS = isIOS();

  const startRecording = async () => {
    console.log('[Recorder] startRecording 실행됨');

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: false,
      },
    });

    if (IS_IOS) {
      const recorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000,
      });
      recorder.startRecording();
      mediaRecorderRef.current = recorder;
    } else {
      console.log('[Recorder] 크롬 등 - MediaRecorder 사용');

      if (typeof MediaRecorder === 'undefined') {
        console.error('[Recorder] MediaRecorder 지원 안 함');
        return;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      console.log('[Recorder] mediaRecorderRef:', mediaRecorderRef.current);
      console.log('[플랫폼]', navigator.userAgent);
      console.log('[isIOS 감지 결과]', IS_IOS);

      mediaRecorder.start();
      console.log('[Recorder] MediaRecorder 시작됨:', mediaRecorder);
    }
    console.log(
      `[Recorder] 녹음 시작 (${IS_IOS ? 'iOS/RecordRTC' : 'MediaRecorder'})`
    );
  };

  const stopRecording = () => {
    console.log('[Recorder] stopRecording() 호출됨');
    console.log('[Recorder] 현재 recorder 상태:', mediaRecorderRef.current);
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;

      if (!recorder) {
        console.warn('[Recorder] stopRecording() 호출됨 - recorder 없음');
        return resolve(null);
      }

      if (IS_IOS) {
        recorder.stopRecording(() => {
          const blob = recorder.getBlob();
          if (!(blob instanceof Blob)) {
            console.error('[RecordRTC] 반환된 오디오가 Blob이 아님:', blob);
            return resolve(null);
          }
          resolve(blob);
        });
      } else {
        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: 'audio/webm',
          });
          resolve(audioBlob);
        };
        recorder.stop();
      }

      // 스트림 정리
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      console.log('[Recorder] 녹음 종료');
    });
  };

  return { startRecording, stopRecording };
}
