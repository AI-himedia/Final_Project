import { useEffect, useState } from 'react';
import useDeceasedProfile from '../zustand/useDeceasedProfile';

const fieldMap = {
  deceasedName: (s) => s.setDeceasedName,
  deceasedNickname: (s) => s.setDeceasedNickname,
  userNickname: (s) => s.setUserNickname,
  relationship: (s) => s.setRelationship,
  gender: (s) => s.setGender,
  deceasedAge: (s) => s.setDeceasedAge,
  personality: (s) => s.setPersonality,
  toneStyle: (s) => s.setToneStyle,
  speakingTone: (s) => s.setSpeakingTone,
  commonPhrases: (s) => s.setCommonPhrases,
  exampleLines: (s) => s.setExampleLines,
};

export default function useDeceasedFormField(fieldKey) {
  const profile = useDeceasedProfile();
  const setter = useDeceasedProfile(fieldMap[fieldKey]);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (profile?.[fieldKey] !== undefined) {
      setValue(profile[fieldKey]);
    }
  }, [profile, fieldKey]);

  const update = (v) => {
    setValue(v);
    setter(v);
  };

  return [value, update];
}
