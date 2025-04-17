import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Deceased.module.css';
import { MdOutlineFileUpload } from 'react-icons/md';

const allowedExtensions = [
  'mp3',
  'aac',
  'ac3',
  'ogg',
  'flac',
  'wav',
  'm4a', // audio
  'avi',
  'mp4',
  'mov',
  'wmv',
  'flv',
  'mkv', // video
];

export default function Step6_FileUpload() {
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const uploaded = e.target.files[0];
    if (!uploaded) return;

    const ext = uploaded.name.split('.').pop().toLowerCase();
    if (allowedExtensions.includes(ext)) {
      setFiles((prev) => [...prev, uploaded]);
    } else {
      alert('지원하지 않는 파일 형식입니다.');
    }
  };

  const handleSubmit = () => {
    if (files.length > 0) {
      console.log('업로드된 파일들:', files);
      // TODO: 서버 업로드 처리
      navigate('/deceased/profile/step7');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>
          고인과 관련된
          <br />
          파일을 첨부해주세요.
        </h2>

        <div className={styles.uploadRow}>
          {/* 서류첨부 박스 */}
          <label className={styles.uploadBox}>
            <MdOutlineFileUpload className={styles.uploadIcon} />
            <span>서류첨부</span>
            <input
              type="file"
              accept={allowedExtensions.map((ext) => '.' + ext).join(',')}
              onChange={handleFileChange}
              hidden
            />
          </label>

          {/* 업로드된 파일들 */}
          {files.map((file, index) => {
            const ext = file.name.split('.').pop().toLowerCase();
            const isAudio = [
              'mp3',
              'aac',
              'ac3',
              'ogg',
              'flac',
              'wav',
              'm4a',
            ].includes(ext);

            return (
              <div key={index} className={styles.fileThumb}>
                <img
                  src={
                    isAudio
                      ? '/assets/sound_default.png'
                      : '/assets/text_default.png'
                  }
                  alt="업로드 미리보기"
                  className={styles.thumbImage}
                />
                <div className={styles.thumbText} title={file.name}>
                  {file.name}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.uploadGuideBox}>
          <p className={styles.uploadGuideTitle}>
            어떤 파일을 첨부해야 할지 모르시겠나요?
          </p>
          <p className={styles.uploadGuideSub}>
            자주 쓰이는 예시들을 확인해보세요 👇
          </p>
          <div className={styles.guideItem}>- 통화 녹음 파일</div>
          <div className={styles.guideItem}>- 메시지 대화 내용 (카카오톡)</div>
        </div>
      </div>

      <button
        className={styles.confirmButton}
        onClick={handleSubmit}
        disabled={files.length === 0}
      >
        다음
      </button>
    </div>
  );
}
