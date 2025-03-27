from pyannote.audio import Pipeline
from pydub import AudioSegment
import os

# wav파일 불러오기
audio_file = "" # 파일 경로

pipeline = Pipeline.from_pretrained(
    "pyannote/speaker-diarization-3.1",
    use_auth_token=""  # Huggingface token
)

import torch
pipeline.to(torch.device("mps"))

# apply pretrained pipeline
diarization = pipeline(audio_file)

# speaker 분리 후 저장
speakers = {}
for turn, _, speaker in diarization.itertracks(yield_label=True):
    if speaker not in speakers:
        speakers[speaker] = []
    speakers[speaker].append([turn.start, turn.end])
    print(f"start={turn.start:.1f}s stop={turn.end:.1f}s speaker_{speaker}")

# speaker별 말하는 부분 저장
# 오디오 파일 불러오기
audio = AudioSegment.from_file(audio_file, format="wav")

# 연결 구간이 짧은 구간 합치기 (뜸들이는 순간)
for speaker in speakers.values():
    for i in range(len(speaker) - 1, 1, -1):
        if speaker[i][0]-speaker[i-1][1] < 1:
            speaker[i-1] = speaker[i-1][0], speaker[i][1]
            speaker.pop(i)

output_folder = "output"

# 폴더가 존재하지 않으면 생성
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# 화자별 음성데이터 저장
speaker_index = 0
for speaker_label, segments in speakers.items():
    for i, segment in enumerate(segments):
        interval = segment[1] - segment[0]
        if interval > 1:
            segment_audio = audio[int(segment[0]*1000):int(segment[1]*1000)]  # 밀리초 단위로 계산
            segment_audio.export(os.path.join(output_folder, f"speaker{speaker_index}_{i}.wav"), format="wav")
    speaker_index += 1

print(diarization)
