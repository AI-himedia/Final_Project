import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getNoticeDetail,
  getComments,
  getLikeCount,
  toggleLike,
  postComment,
} from '../../api/NoticeApi';

function NoticeDetail() {
  const { id } = useParams();
  const [notice, setNotice] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);
  const [newComment, setNewComment] = useState('');

  const userId = 7; // 예시 사용자 ID

  useEffect(() => {
    getNoticeDetail(id).then((res) => setNotice(res.data));
    getComments(id).then((res) => setComments(res.data));
    getLikeCount(id).then((res) => setLikes(res.data));
  }, [id]);

  const handleLike = () => {
    toggleLike(id, userId).then(() => {
      getLikeCount(id).then((res) => setLikes(res.data));
    });
  };

  const handleComment = () => {
    if (!newComment) return;
    postComment(id, { content: newComment, writer: '홍길동' }).then(() => {
      setNewComment('');
      getComments(id).then((res) => setComments(res.data));
    });
  };

  if (!notice) return <div>Loading...</div>;

  return (
    <div>
      <h2>{notice.title}</h2>
      <p>{notice.content}</p>
      <p>조회수: {notice.views}</p>
      <p>좋아요: {likes}</p>
      <button onClick={handleLike}>❤️ 좋아요</button>

      <hr />

      <h3>댓글</h3>
      <ul>
        {comments.map((c) => (
          <li key={c.id}>
            <strong>{c.writer}</strong>: {c.content}
          </li>
        ))}
      </ul>

      <input
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="댓글 입력"
      />
      <button onClick={handleComment}>등록</button>
    </div>
  );
}

export default NoticeDetail;
