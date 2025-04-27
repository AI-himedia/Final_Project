import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../../api/AxiosInstance';
import style from './SignUpPage.module.css';
import { Toast } from '../../../utils/Swal';

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

  const queryParams = new URLSearchParams(location.search);
  const emailFromQuery = queryParams.get('email') || '';
  const fullNameFromQuery = queryParams.get('name') || '';

  const email = emailFromState || emailFromQuery;
  const fullName = fullNameFromState || fullNameFromQuery;

  const [form, setForm] = useState({
    email,
    oauth,
    fullName,
    gender: initialGender,
    number: initialNumber,
  });

  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'number') {
      let onlyNums = value.replace(/[^0-9]/g, '');
      let formattedNumber = onlyNums;
      if (onlyNums.length < 4) {
        formattedNumber = onlyNums;
      } else if (onlyNums.length < 8) {
        formattedNumber = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
      } else {
        formattedNumber = `${onlyNums.slice(0, 3)}-${onlyNums.slice(
          3,
          7
        )}-${onlyNums.slice(7, 11)}`;
      }
      setForm({ ...form, [name]: formattedNumber });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitForm = {
        ...form,
        number: form.number.replace(/-/g, ''),
      };
      await axiosInstance.post('/member/signup', submitForm);

      navigate('/', { state: { signupSuccess: true } });
    } catch (err) {
      await Toast.fire({
        icon: 'error',
        title: '회원가입 실패',
      });
    }
  };

  useEffect(() => {
    if (form.fullName || form.number) {
      navigate(location.pathname, { replace: true });
    }
  }, [form.fullName, form.number, navigate, location.pathname]);

  return (
    <div className={style.Container}>
      <div className={style.Content}>
        <h2 className={style.Title}>
          회원가입 완료를 위해서
          <br />
          간단한 정보를 입력해 주세요.
          <p className={style.SubTitle}>
            회원가입을 완료하기 위해 몇 가지 정보를 더 입력해주세요.
          </p>
        </h2>

        {/* 이메일 */}
        <div className={style.InputGroup}>
          {(focusedField === 'email' || form.email) && (
            <label className={style.ClickLabel}>이메일</label>
          )}
          <input
            className={style.Email}
            type="email"
            name="email"
            value={form.email}
            disabled
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            placeholder={
              focusedField !== 'email' && !form.email ? '이메일' : ''
            }
          />
        </div>

        {/* 성함 */}
        <div className={style.InputGroup}>
          {(focusedField === 'fullName' || form.fullName) && (
            <label className={style.ClickLabel}>성함</label>
          )}
          <input
            className={style.FullName}
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            onFocus={() => setFocusedField('fullName')}
            onBlur={() => setFocusedField(null)}
            placeholder={
              focusedField !== 'fullName' && !form.fullName ? '성함' : ''
            }
            required
          />
        </div>

        {/* 성별 */}
        <div className={style.InputGroup}>
          {(focusedField === 'gender' || form.gender) && (
            <label className={style.ClickLabel}>성별</label>
          )}
          <select
            className={style.Select}
            name="gender"
            value={form.gender}
            onChange={handleChange}
            onFocus={() => setFocusedField('gender')}
            onBlur={() => setFocusedField(null)}
            required
          >
            <option value="">선택</option>
            <option value="M">남성</option>
            <option value="F">여성</option>
          </select>
        </div>

        {/* 전화번호 */}
        <div className={style.InputGroup}>
          {(focusedField === 'number' || form.number) && (
            <label className={style.ClickLabel}>전화번호</label>
          )}
          <input
            className={style.FullName}
            type="text"
            name="number"
            value={form.number}
            onChange={handleChange}
            onFocus={() => setFocusedField('number')}
            onBlur={() => setFocusedField(null)}
            placeholder={
              focusedField !== 'number' && !form.number ? '전화번호' : ''
            }
            required
          />
        </div>
      </div>

      <button onClick={handleSubmit} className={style.Button}>
        가입 완료
      </button>
    </div>
  );
}
