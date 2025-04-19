from pydantic import BaseModel
from typing import Optional
from typing import List

class DeceasedData(BaseModel):
    deceasedCode: Optional[int] = None
    deceasedName: Optional[str] = None
    gender: Optional[str] = None
    deceasedAge: Optional[int] = None
    personality: Optional[str] = None
    deceasedNickname: Optional[str] = None
    userNickname: Optional[str] = None
    relationship: Optional[str] = None
    speakingTone: Optional[bool] = None
    toneStyle: Optional[str] = None
    commonPhrases: Optional[List[str]] = None
    exampleLines: Optional[List[str]] = None

class DeceasedHint(BaseModel):
    nickname: Optional[str] = None
    smsBubbleSide: Optional[str] = None

class ServiceStartRequest(BaseModel):
    subscriptionCode: int
    deceasedData: DeceasedData
    deceasedHint: DeceasedHint
    chatFileUrls: List[str]
    presignedUrls: List[str]
