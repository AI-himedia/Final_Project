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

  // Setter 함수들
  setDeceasedName: (val) => set({ deceased_name: val }),
  setGender: (val) => set({ gender: val }),
  setDeceasedAge: (val) => set({ deceased_age: val }),
  setDeceasedNickname: (val) => set({ deceased_nickname: val }),
  setUserNickname: (val) => set({ user_nickname: val }),
  setRelationship: (val) => set({ relationship: val }),
  setSpeakingTone: (val) => set({ speaking_tone: val }),
  setPersonality: (val) => set({ personality: val }),

  // 전체 초기화
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
    }),
}));

export default useDeceasedProfile;
