import { create } from 'zustand';

const useDeceasedProfile = create((set) => ({
  deceasedName: '',
  gender: '',
  deceasedAge: 0,
  deceasedNickname: '',
  userNickname: '',
  relationship: '',
  speakingTone: false,
  personality: '',
  subscriptionCode: '',
  files: [],
  setDeceasedName: (val) => set({ deceasedName: val }),
  setGender: (val) => set({ gender: val }),
  setDeceasedAge: (val) => set({ deceasedAge: val }),
  setDeceasedNickname: (val) => set({ deceasedNickname: val }),
  setUserNickname: (val) => set({ userNickname: val }),
  setRelationship: (val) => set({ relationship: val }),
  setSpeakingTone: (val) => set({ speakingTone: val }),
  setPersonality: (val) => set({ personality: val }),
  setSubscriptionCode: (val) => set({ subscriptionCode: val }),
  setFiles: (fileList) => set({ files: fileList }),
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  removeFile: (index) =>
    set((state) => {
      const newFiles = [...state.files];
      newFiles.splice(index, 1);
      return { files: newFiles };
    }),
  setFileMeta: (index, meta) =>
    set((state) => {
      const updatedFiles = [...state.files];
      const file = state.files[index];
      if (!file) return {};
      updatedFiles[index] = {
        file,
        meta: {
          ...(file.meta || {}),
          ...meta,
        },
      };
      return { files: updatedFiles };
    }),
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
  setDeceasedProfile: (profile) =>
    set({
      deceasedName: profile.deceasedName || '',
      gender: profile.gender || '',
      deceasedAge: profile.deceasedAge || 0,
      deceasedNickname: profile.deceasedNickname || '',
      userNickname: profile.userNickname || '',
      relationship: profile.relationship || '',
      speakingTone: profile.speakingTone || false,
      personality: profile.personality || '',
      subscriptionCode:
        profile.subscriptionCode ||
        profile.serviceSubscriptions?.[0]?.subscriptionCode ||
        '',
    }),
  resetProfile: () =>
    set({
      deceasedName: '',
      gender: '',
      deceasedAge: 0,
      deceasedNickname: '',
      userNickname: '',
      relationship: '',
      speakingTone: false,
      personality: '',
      subscriptionCode: '',
      files: [],
    }),
}));

export const mapStateToApiFormat = (state) => ({
  subscriptionCode: state.subscriptionCode,
  deceasedData: {
    deceasedName: state.deceasedName,
    gender: state.gender,
    deceasedAge: state.deceasedAge,
    personality: state.personality,
    deceasedNickname: state.deceasedNickname,
    userNickname: state.userNickname,
    relationship: state.relationship,
    speakingTone: state.speakingTone,
  },
});

export default useDeceasedProfile;
