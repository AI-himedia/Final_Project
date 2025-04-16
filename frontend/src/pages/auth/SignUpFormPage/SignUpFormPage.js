// src/components/SignupFormPage.js
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/AxiosInstance';
import { useDispatch } from 'react-redux';
import { setLogin } from '../redux/LoginSlice';

const SignupForm = ({ kakaoUserData }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: kakaoUserData.email || '',
    full_name: '',
    gender: '',
    number: '',
    admin: false,
  });

  // 폼 데이터 업데이트
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 회원가입 처리 함수
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post('/member/signup', formData);
      dispatch(setLogin(res.data.email));
      alert('회원가입이 완료되었습니다!');
    } catch (err) {
      console.error('[DEBUG] 회원가입 실패:', err);
      alert('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>이메일</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled
        />
      </div>
      <div>
        <label>이름</label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>성별</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">성별 선택</option>
          <option value="M">남성</option>
          <option value="F">여성</option>
        </select>
      </div>
      <div>
        <label>전화번호</label>
        <input
          type="text"
          name="number"
          value={formData.number}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>관리자 여부</label>
        <input
          type="checkbox"
          name="admin"
          checked={formData.admin}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, admin: e.target.checked }))
          }
        />
      </div>
      <button type="submit">회원가입</button>
    </form>
  );
};

export default SignupForm;
