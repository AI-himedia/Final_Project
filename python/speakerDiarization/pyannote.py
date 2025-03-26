from pyannote.audio import Pipeline

# pipeline 불러오기 (사전 학습된 화자 분리 모델 사용)
pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization", use_auth_token="")

# 분석할 오디오 파일 경로
audio_file = "/audio_1.m4a"

# diarization 수행
diarization = pipeline(audio_file)

# 결과 출력
for turn, _, speaker in diarization.itertracks(yield_label=True):
    print(f"{turn.start:.1f}s ~ {turn.end:.1f}s: 화자 {speaker}")
