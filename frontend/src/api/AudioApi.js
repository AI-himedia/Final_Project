import axios from 'axios';

/**
 * React에서 녹음된 오디오와 구독 코드를 서버로 전송
 * @param {Blob} audioBlob - 사용자의 발화 오디오 (wav or mp3)
 * @param {string|number} subscriptionCode - 사용자 구독 코드
 * @returns {Promise<{ text: string, audio: string }>} - LLM 텍스트 응답과 base64 mp3
 */
export async function AudioApi(audioBlob, subscriptionCode) {
  if (!audioBlob || !(audioBlob instanceof Blob)) {
    console.error('녹음된 오디오가 유효하지 않습니다:', audioBlob);
    return;
  }

  const formData = new FormData();
  formData.append('audio', audioBlob, 'input.wav');
  formData.append('subscriptionCode', subscriptionCode); // 실제 구독 코드 사용

  try {
    const response = await axios.post(
      'http://localhost:8080/be/call/audio', // FastAPI 엔드포인트로 변경 필요 시 수정
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error('오디오 전송 중 오류 발생:', error);
    throw error;
  }
}
