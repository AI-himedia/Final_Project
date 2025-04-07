import React, { useEffect, useState } from 'react';
import { getNoticeList } from '../../api/NoticeApi';
import '../../css/web/pages/notice/NoticeList.css';

const NoticeList = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getNoticeList();
        console.log('📦 공지사항 목록 응답:', data);
        setNotices(data);
      } catch (e) {
        console.error('공지사항 목록 조회 실패', e);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <h2 className="notice-title">공지사항</h2>
      <div className="notice-container">
        <div className="notice-table">
          <div className="notice-header">
            <div className="notice-col id">번호</div>
            <div className="notice-col title">제목</div>
            <div className="notice-col author">글쓴이</div>
            <div className="notice-col date">작성일</div>
            <div className="notice-col views">조회수</div>
          </div>

          {notices.map((notice) => (
            <div className="notice-row" key={notice.id}>
              <div className="notice-col id">{notice.id}</div>
              <div className="notice-col title">{notice.title}</div>
              <div className="notice-col author">{notice.author}</div>
              <div className="notice-col date">
                {new Date(notice.date).toLocaleDateString('ko-KR')}
              </div>
              <div className="notice-col views">{notice.views}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default NoticeList;
