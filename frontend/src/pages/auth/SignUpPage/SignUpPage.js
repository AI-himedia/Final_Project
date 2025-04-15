// src/pages/shared/auth/SignUpPage.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../../api/AxiosInstance';
import style from './SignUpPage.module.css';

export default function SignUpPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    email: emailFromState = '',
    oauth = 'KAKAO',
    fullName: fullNameFromState = '',
    gender: initialGender = '',
    number: initialNumber = '',
  } = location.state || {};

  // URL 쿼리 파라미터로부터 데이터 추출
  const queryParams = new URLSearchParams(location.search);
  const emailFromQuery = queryParams.get('email') || '';
  // 기존에는 fullName 쿼리 파라미터를 가져왔는데, 백엔드에서는 "name"으로 보내므로 변경
  const fullNameFromQuery = queryParams.get('name') || '';

  // state 우선, 없으면 쿼리 파라미터 사용
  const email = emailFromState || emailFromQuery;
  const fullName = fullNameFromState || fullNameFromQuery;

  const [form, setForm] = useState({
    email,
    oauth,
    fullName,
    gender: initialGender,
    number: initialNumber,
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/member/signup', form);
      alert('회원가입 완료!');
      navigate('/');
    } catch (err) {
      console.error('회원가입 실패:', err);
      alert('회원가입 실패');
    }
  };

  return (
    <div className={style.Container}>
      <h2>추가 정보 입력</h2>
      <form onSubmit={handleSubmit}>
        <div className={style.FromContainer}>
          <label>이메일</label>
          <input type="email" name="email" value={form.email} disabled />
        </div>
        <div>
          <label>성함</label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>성별</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
          >
            <option value="">선택</option>
            <option value="M">남성</option>
            <option value="F">여성</option>
          </select>
        </div>
        <div>
          <label>전화번호</label>
          <input
            type="text"
            name="number"
            placeholder="예) 010-1234-5678"
            value={form.number}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">가입 완료</button>
      </form>
    </div>
  );
}
