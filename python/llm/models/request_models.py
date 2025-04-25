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

class AnalyzableFile(BaseModel):
    fileUrl: str
    presignedUrl: Optional[str]
    deceasedHint: DeceasedHint

class ServiceStartRequest(BaseModel):
    subscriptionCode: int
    deceasedData: DeceasedData
    analyzableFiles: List[AnalyzableFile]

class ChatRequest(BaseModel):
    subscriptionCode: int
    userInput: str
    serviceType: str

class TestRequest(BaseModel):
    subscriptionCode: int
    