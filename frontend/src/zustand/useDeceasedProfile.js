// src/zustand/useDeceasedProfile.js

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
