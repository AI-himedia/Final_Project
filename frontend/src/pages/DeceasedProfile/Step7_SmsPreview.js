import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Deceased.module.css';
import useDeceasedProfile from '../../zustand/useDeceasedProfile';

export default function Step7_SMS() {
  console.log('[zustand 전체 상태7 SMS]', useDeceasedProfile.getState());
  const navigate = useNavigate();
  const { files, setFileMeta } = useDeceasedProfile();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('preview');
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [inputName, setInputName] = useState('');
  const [fileClicked, setFileClicked] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const openModal = (file, index, mode = 'preview') => {
    setSelectedFile(file);
    setCurrentFileIndex(index);
    setModalMode(mode);
    setIsModalOpen(true);

    const ext = file.name?.split('.').pop().toLowerCase();
    if (ext === 'txt' && mode === 'preview') {
      const reader = new FileReader();
      reader.onload = () => {
        const raw = reader.result;
        const cleaned = raw
          .replace(
            /20[0-9]{2}년\s*\d{1,2}월\s*\d{1,2}일\s*(오전|오후)\s*\d{1,2}:\d{2}/g,
            ''
          )
          .replace(/, /g, '')
          .replace(/\n{2,}/g, '\n')
          .trim();
        setConversation(cleaned);
      };
      reader.readAsText(file);
    } else {
      setConversation(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setConversation(null);
    setInputName('');
  };

  const handleSideSelection = (side) => {
    setFileMeta(currentFileIndex, { side, selected: true });
    setFileClicked(false);
    closeModal();
  };

  const handleNameSubmit = () => {
    if (inputName.trim()) {
      setFileMeta(currentFileIndex, { name: inputName.trim(), selected: true });
      setFileClicked(false);
      closeModal();
    }
  };

  const allSelected = files.every((f) => f.meta?.selected);
  const nextUnselectedIndex = files.findIndex((f) => !f.meta?.selected);
  const nextUnselected =
    nextUnselectedIndex === -1 ? files.length : nextUnselectedIndex;

  const confirmText = allSelected
    ? '프로필 저장하기'
    : `${nextUnselected + 1}번째 파일을 선택하고 화자분리를 해주세요.`;

  const handleSubmit = () => {
    if (allSelected) navigate('/deceased/profile/step8');
  };

  const handleFileClick = (file, index) => {
    if (index > nextUnselected) return;
    setSelectedFile(file);
    setCurrentFileIndex(index);
    setFileClicked(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>
          첨부파일 속 <br />
          고인을 선택해주세요.
          <p className={styles.helperText}>
            첨부된 파일에서 화자를 확인하고, 고인을 선택해주세요.
          </p>
        </h2>

        <div className={styles.uploadRow}>
          {files.length > 0 ? (
            files.map((fileWrapper, index) => {
              const file = fileWrapper.file || fileWrapper;
              const isDisabled = !!fileWrapper.meta?.selected;
              return (
                <div
                  key={index}
                  className={`${styles.fileWrapper} ${
                    isDisabled ? styles.disabled : ''
                  }`}
                  onClick={() => {
                    if (!isDisabled) handleFileClick(file, index);
                  }}
                >
                  <div className={styles.fileThumb}>
                    {renderFilePreview(fileWrapper, index)}
                    <div className={styles.thumbText}>{file.name}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <p>첨부된 파일이 없습니다.</p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modal} onClick={closeModal}>
          <div
            className={`${styles.modalContent} ${
              modalMode === 'select' ? styles.select : ''
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {modalMode === 'select' && selectedFile && (
              <div className={styles.modalButtons}>
                {['png', 'jpg', 'jpeg'].includes(
                  selectedFile.name.split('.').pop().toLowerCase()
                ) ? (
                  <div className={styles.title}>
                    <p>
                      고인이 대화속에서
                      <br />
                      왼쪽인가요, 오른쪽인가요?
                    </p>
                    <div
                      className={styles.toneGroup}
                      style={{ marginTop: '1rem' }}
                    >
                      <button
                        className={styles.toneButton}
                        onClick={() => handleSideSelection('left')}
                      >
                        왼쪽
                      </button>
                      <button
                        className={styles.toneButton}
                        onClick={() => handleSideSelection('right')}
                      >
                        오른쪽
                      </button>
                    </div>
                  </div>
                ) : selectedFile.name.endsWith('.txt') ? (
                  <div className={styles.inputGroup}>
                    <div
                      className={styles.title}
                      style={{ marginBottom: '-1.5rem' }}
                    >
                      <p style={{ marginBottom: '3rem' }}>
                        텍스트 파일에서
                        <br />
                        고인의 성함을 작성해주세요.
                      </p>

                      {(isFocused || inputName) && (
                        <label
                          className={styles.floatingLabel}
                          style={{ top: '85px' }}
                        >
                          고인의 성함을 입력해주세요
                        </label>
                      )}

                      <div className={styles.inputWrapper}>
                        <input
                          type="text"
                          value={inputName}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                          onChange={(e) => setInputName(e.target.value)}
                          className={styles.input}
                          placeholder={
                            isFocused ? '' : '고인의 성함을 입력해주세요'
                          }
                        />
                      </div>

                      {inputName && (
                        <button
                          type="button"
                          className={styles.clearButton}
                          onClick={() => setInputName('')}
                          aria-label="입력 지우기"
                        >
                          ✕
                        </button>
                      )}

                      <button
                        className={styles.confirmButton}
                        onClick={handleNameSubmit}
                      >
                        입력 완료
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {modalMode === 'preview' &&
              selectedFile &&
              (conversation ? (
                <pre className={styles.modalText}>{conversation}</pre>
              ) : (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="확대된 이미지"
                  className={styles.modalImage}
                />
              ))}
          </div>
        </div>
      )}

      <div className={styles.confirmButtonWrapper}>
        <div className={styles.separation}>{confirmText}</div>

        {!fileClicked ? (
          <button
            className={styles.confirmButton}
            onClick={handleSubmit}
            disabled={!allSelected}
          >
            프로필 저장하기
          </button>
        ) : (
          <>
            <div className={styles.confirmButtonSplitWrapper}>
              <button
                className={`${styles.confirmButton} ${styles.splitLeft}`}
                onClick={() => {
                  if (selectedFile)
                    openModal(selectedFile, currentFileIndex, 'preview');
                }}
              >
                확대하기
              </button>
              <button
                className={`${styles.confirmButton} ${styles.splitRight}`}
                onClick={() => {
                  if (selectedFile)
                    openModal(selectedFile, currentFileIndex, 'select');
                }}
              >
                선택하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  function renderFilePreview(wrapped, index) {
    const file = wrapped.file || wrapped;
    if (!file || !file.name) return null;

    const ext = file.name.split('.').pop().toLowerCase();
    const isSelected = index === currentFileIndex;
    const classNames = `${styles.thumbImage} ${
      isSelected ? styles.selected : ''
    }`;

    if (['png', 'jpg', 'jpeg'].includes(ext)) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt="미리보기"
          className={classNames}
        />
      );
    }

    if (ext === 'txt') {
      return (
        <img
          src="/assets/text_default.png"
          alt="텍스트"
          className={classNames}
        />
      );
    }

    return (
      <img
        src="/assets/file_default.png"
        alt="기본 파일"
        className={classNames}
      />
    );
  }
}
