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
    commonPhrases: Optional[str] = None
    exampleLines: Optional[str] = None

class ServiceStartRequest(BaseModel):
    subscriptionCode: int
    deceasedData: DeceasedData
    chatFileUrls: List[str]
