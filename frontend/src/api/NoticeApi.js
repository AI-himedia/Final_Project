// src/api/NoticeApi.js
// 공지사항 관련 API 호출을 관리하는 파일입니다.
// 모든 함수는 axiosInstance를 통해 서버와 통신하며, 공통적인 에러 핸들링 포함합니다.

import axiosInstance from './AxiosInstance';

// 공지사항 목록 조회
export const getNoticeList = async () => {
  try {
    const response = await axiosInstance.get('/notices');
    return response.data; // 서버로부터 받은 공지사항 리스트 반환
  } catch (error) {
    console.error('공지사항 목록 조회 실패', error);
    throw error;
  }
};

// 공지사항 상세 조회
export const getNoticeDetail = async (id) => {
  try {
    const response = await axiosInstance.get(`/notices/${id}`);
    return response.data;
  } catch (error) {
    console.error('공지사항 상세 조회 실패', error);
    throw error;
  }
};

// 공지사항 작성
export const createNotice = async (data) => {
  try {
    const response = await axiosInstance.post('/notices', data);
    return response.data;
  } catch (error) {
    console.error('공지사항 작성 실패', error);
    throw error;
  }
};

// 댓글 등록
export const postComment = async (noticeId, data) => {
  try {
    const response = await axiosInstance.post(
      `/notices/${noticeId}/comments`,
      data
    );
    return response.data;
  } catch (error) {
    console.error('댓글 등록 실패', error);
    throw error;
  }
};

// 댓글 조회
export const getComments = async (noticeId) => {
  try {
    const response = await axiosInstance.get(`/notices/${noticeId}/comments`);
    return response.data;
  } catch (error) {
    console.error('댓글 조회 실패', error);
    throw error;
  }
};

// 좋아요 토글
export const toggleLike = async (noticeId, userId) => {
  try {
    const response = await axiosInstance.post(`/notices/${noticeId}/likes`, {
      userId,
    });
    return response.data;
  } catch (error) {
    console.error('좋아요 토글 실패', error);
    throw error;
  }
};

// 좋아요 개수 조회
export const getLikeCount = async (noticeId) => {
  try {
    const response = await axiosInstance.get(
      `/notices/${noticeId}/likes/count`
    );
    return response.data;
  } catch (error) {
    console.error('좋아요 수 조회 실패', error);
    throw error;
  }
};
