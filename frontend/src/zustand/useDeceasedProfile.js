import { create } from 'zustand';

const useDeceasedProfile = create((set) => ({
  // 고유 정보
  deceased_name: '',
  gender: '',
  deceased_age: 0,

  // 호칭 관련
  deceased_nickname: '',
  user_nickname: '',

  // 관계 및 말투
  relationship: '',
  speaking_tone: false,

  // 기타
  personality: '',
  subscription_Code: '',

  // 업로드 파일들
  files: [],

  // Setter 함수들
  setDeceasedName: (val) => set({ deceased_name: val }),
  setGender: (val) => set({ gender: val }),
  setDeceasedAge: (val) => set({ deceased_age: val }),
  setDeceasedNickname: (val) => set({ deceased_nickname: val }),
  setUserNickname: (val) => set({ user_nickname: val }),
  setRelationship: (val) => set({ relationship: val }),
  setSpeakingTone: (val) => set({ speaking_tone: val }),
  setPersonality: (val) => set({ personality: val }),
  setSubscriptionCode: (val) => set({ subscription_Code: val }),

  // 파일 관련
  setFiles: (fileList) => set({ files: fileList }),
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  removeFile: (index) =>
    set((state) => {
      const newFiles = [...state.files];
      newFiles.splice(index, 1);
      return { files: newFiles };
    }),

  // 파일 meta 업데이트 (side, name 등 포함)
  setFileMeta: (index, meta) =>
    set((state) => {
      const updatedFiles = [...state.files];

      // File 인스턴스에 직접 meta 넣지 않고, wrap 형태로 감싸기
      const file = state.files[index];
      if (!file) return {};

      updatedFiles[index] = {
        file, // 원본 File 객체
        meta: {
          ...(file.meta || {}),
          ...meta,
        },
      };

      return { files: updatedFiles };
    }),

  // 개별 기능 유지 (이전 방식)
  setFileSelection: (index, selection) =>
    set((state) => {
      const updatedFiles = [...state.files];
      updatedFiles[index].selection = selection;
      return { files: updatedFiles };
    }),

  setDeceasedNameForFile: (index, name) =>
    set((state) => {
      const updatedFiles = [...state.files];
      updatedFiles[index].deceasedName = name;
      return { files: updatedFiles };
    }),

  // 전체 프로필 일괄 저장
  setDeceasedProfile: (profile) =>
    set({
      deceased_name: profile.deceasedName || '',
      gender: profile.gender || '',
      deceased_age: profile.deceasedAge || 0,
      deceased_nickname: profile.deceasedNickname || '',
      user_nickname: profile.userNickname || '',
      relationship: profile.relationship || '',
      speaking_tone: profile.speakingTone || false,
      personality: profile.personality || '',
      subscription_Code:
        profile.subscriptionCode ||
        profile.serviceSubscriptions?.[0]?.subscriptionCode ||
        '',
    }),

  // 초기화
  resetProfile: () =>
    set({
      deceased_name: '',
      gender: '',
      deceased_age: 0,
      deceased_nickname: '',
      user_nickname: '',
      relationship: '',
      speaking_tone: false,
      personality: '',
      subscription_Code: '',
      files: [],
    }),
}));

// API 전송용 변환 함수
export const mapStateToApiFormat = (state) => ({
  subscriptionCode: state.subscription_Code,
  deceasedData: {
    deceasedName: state.deceased_name,
    gender: state.gender,
    deceasedAge: state.deceased_age,
    personality: state.personality,
    deceasedNickname: state.deceased_nickname,
    userNickname: state.user_nickname,
    relationship: state.relationship,
    speakingTone: state.speaking_tone,
  },
});

export default useDeceasedProfile;