// src/pages/SignupPage.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { axiosInstance } from '../../../../api/axios/AxiosInstance';
import './SignUpPage.web.css';

export default function SignUpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, oauth } = location.state || {};

  const [form, setForm] = useState({
    email: email || '',
    oauth: oauth || 'KAKAO',
    fullName: '',
    gender: '',
    number: '',
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
    <div className="signup-container">
      <h2>추가 정보 입력</h2>
      <form onSubmit={handleSubmit} className="signup-form">
        <div>
          <label>이메일</label>
          <input type="email" name="email" value={form.email} disabled />
        </div>
        <div>
          <label>이름</label>
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
