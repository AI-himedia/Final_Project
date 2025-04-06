import React, { useState } from 'react';
import { createNotice } from '../../api/NoticeApi';
import { useNavigate } from 'react-router-dom';

function NoticeCreate() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!title || !content) return;
    createNotice({ title, content }).then(() => navigate('/notice'));
  };

  return (
    <div>
      <h2>공지 등록</h2>
      <input
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <br />
      <textarea
        placeholder="내용"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <br />
      <button onClick={handleSubmit}>등록</button>
    </div>
  );
}

export default NoticeCreate;
