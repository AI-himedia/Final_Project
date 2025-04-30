import { useNavigate } from 'react-router-dom';
import styles from './Deceased.module.css';
import { MdOutlineFileUpload } from 'react-icons/md';
import useDeceasedProfile from '../../zustand/useDeceasedProfile';
import { axiosInstance } from '../../api/AxiosInstance';
import { useEffect, useRef } from 'react';
import { Toast } from '../../utils/Swal';
import { useLoading } from '../../contexts/LoadingContext';

const audioVideoExtensions = [
  'mp3',
  'aac',
  'ac3',
  'ogg',
  'flac',
  'wav',
  'm4a',
  'avi',
  'mp4',
  'mov',
  'wmv',
  'flv',
  'mkv',
];
const imageTextExtensions = ['png', 'jpg', 'jpeg', 'txt'];
const MAX_AUDIO_COUNT = 3;
const MAX_TXT_SIZE_MB = 10;

export default function Step6_FileUpload() {
  console.log('[zustand 전체 상태6]', useDeceasedProfile.getState());
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { setIsLoading } = useLoading();
  const serviceCode = localStorage.getItem('@againhello/service-code');

  const {
    subscriptionCode,
    deceasedName,
    gender,
    deceasedAge,
    personality,
    deceasedNickname,
    userNickname,
    relationship,
    speakingTone,
    files,
    addFile,
    removeFile,
  } = useDeceasedProfile();

  const allowedExtensions =
    serviceCode === '2' || serviceCode === '3'
      ? audioVideoExtensions
      : imageTextExtensions;

  useEffect(() => {
    const cleanupAudio = async () => {
      try {
        if (subscriptionCode) {
          await axiosInstance.post(
            `/call/audio/cleanup?subscriptionCode=${subscriptionCode}`
          );
        }
      } catch (error) {
        console.error('Audio cleanup API 요청 실패:', error);
      }
    };

    cleanupAudio();
  }, [subscriptionCode]);

  const handleFileChange = (e) => {
    const uploaded = e.target.files[0];
    if (!uploaded) return;

    const ext = uploaded.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      Toast.fire({
        icon: 'warning',
        title: '지원하지 않는 파일 형식입니다.',
      });
      return;
    }

    if (ext === 'txt') {
      const sizeInMB = uploaded.size / (1024 * 1024);
      if (sizeInMB > MAX_TXT_SIZE_MB) {
        Toast.fire({
          icon: 'warning',
          title: `텍스트 파일은 ${MAX_TXT_SIZE_MB}MB 이하만 업로드 가능합니다.`,
        });
        return;
      }
    }

    const isAudio = ['mp3', 'aac', 'ac3', 'ogg', 'flac', 'wav', 'm4a'].includes(
      ext
    );
    if (isAudio) {
      const currentAudioCount = files.filter((f) =>
        ['mp3', 'aac', 'ac3', 'ogg', 'flac', 'wav', 'm4a'].includes(
          f.name.split('.').pop().toLowerCase()
        )
      ).length;
      if (currentAudioCount >= MAX_AUDIO_COUNT) {
        Toast.fire({
          icon: 'warning',
          title: `오디오 파일은 최대 ${MAX_AUDIO_COUNT}개까지 등록 가능합니다.`,
        });
        return;
      }
    }

    addFile(uploaded);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;

    const formData = new FormData();

    // sms 서비스일 경우,
    if (serviceCode === '1') {
      navigate('/deceased/profile/step7-sms');
      return;
    }

    // if (serviceCode === '1') {
    //   const validFile = files.find((file) => {
    //     const ext = file.name.split('.').pop().toLowerCase();
    //     return imageTextExtensions.includes(ext);
    //   });

    //   if (!validFile) {
    //     alert('png, jpg, jpeg, txt 중 하나 이상의 파일이 필요합니다.');
    //     return;
    //   }

    //   const chatFile = files.find((file) => file.name.endsWith('.txt'));
    //   const deceasedCode = localStorage.getItem('@againhello/deceased-code');

    //   formData.append('subscriptionCode', subscription_Code);
    //   if (chatFile) formData.append('chatFile', chatFile);

    //   const deceasedData = {
    //     deceasedName: deceased_name,
    //     gender,
    //     deceasedAge: deceased_age,
    //     personality: Array.isArray(personality)
    //       ? personality.join(', ')
    //       : personality,
    //     deceasedNickname: deceased_nickname,
    //     userNickname: user_nickname,
    //     relationship,
    //     speakingTone: speaking_tone,
    //     ...(deceasedCode && { deceasedCode: Number(deceasedCode) }),
    //   };

    //   formData.append(
    //     'deceasedData',
    //     new Blob([JSON.stringify(deceasedData)], { type: 'application/json' })
    //   );
    // }

    // call 서비스일 경우,
    if (serviceCode === '2' || serviceCode === '3') {
      const audioFiles = files.filter((file) =>
        ['mp3', 'aac', 'ac3', 'ogg', 'flac', 'm4a'].includes(
          file.name.split('.').pop().toLowerCase()
        )
      );

      const requestData = {
        subscriptionCode: Number(subscriptionCode),
        deceasedData: {
          deceasedName: deceasedName,
          gender,
          deceasedAge: deceasedAge,
          personality: Array.isArray(personality)
            ? personality.join(', ')
            : personality,
          deceasedNickname: deceasedNickname,
          userNickname: userNickname,
          relationship,
          speakingTone: speakingTone,
        },
      };

      audioFiles.forEach((file) => formData.append('audioFiles', file));
      formData.append(
        'request',
        new Blob([JSON.stringify(requestData)], { type: 'application/json' })
      );
    }

    setIsLoading(true);

    try {
      if (serviceCode === '1') {
        await axiosInstance.post('/sms/service/start', formData);
        navigate('/deceased/profile/step7-sms');
      } else if (serviceCode === '2' || serviceCode === '3') {
        const response = await axiosInstance.post(
          '/call/service/start-and-separate',
          formData
        );
        navigate('/deceased/profile/step7-call', {
          state: { previewData: response.data.preview },
        });
      }
    } catch (err) {
      Toast.fire({
        icon: 'warning',
        title: `서버 요청 중 오류가 발생했습니다.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>
          고인과 관련된
          <br />
          파일을 첨부해주세요.
          {serviceCode === '2' || serviceCode === '3' ? (
            <p className={styles.helperText}>
              업로드 가능한 파일 형식:
              <br />
              오디오/비디오 파일(mp3, mp4 등)
              <br />* 오디오 파일은 최대 3개까지만 등록할 수 있어요
            </p>
          ) : (
            <p className={styles.helperText}>
              업로드 가능한 파일 형식:
              <br />
              이미지 또는 텍스트 파일(png, jpg, txt 등)
              <br />* 텍스트(txt)는 10MB 이하만 가능해요
            </p>
          )}
        </h2>

        <div
          className={`${styles.uploadRow} ${
            files.length === 1 ? styles.singleUploadRow : ''
          }`}
        >
          <label className={styles.uploadBox}>
            <MdOutlineFileUpload className={styles.uploadIcon} />
            <span>파일 첨부</span>
            <input
              type="file"
              accept={allowedExtensions.map((ext) => '.' + ext).join(',')}
              onChange={handleFileChange}
              hidden
              ref={fileInputRef}
            />
          </label>

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
              <div
                key={index}
                className={styles.fileThumb}
                onClick={() => removeFile(index)}
                style={{ cursor: 'pointer' }}
                title="클릭하면 삭제됩니다"
              >
                <img
                  src={
                    isAudio
                      ? 'https://raw.githubusercontent.com/AI-himedia/Final_Project_Assets/main/sound_default.png'
                      : 'https://raw.githubusercontent.com/AI-himedia/Final_Project_Assets/main/text_default.png'
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
      </div>

      <p className={styles.Warning}>* 파일을 터치하면 삭제 됩니다 !</p>

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

      <button
        className={styles.confirmButton}
        onClick={handleSubmit}
        disabled={files.length === 0}
      >
        {serviceCode === '1' ? '다음' : '프로필 저장하기'}
      </button>
    </div>
  );
}
