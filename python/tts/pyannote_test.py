from pyannote.audio import Pipeline
from pydub import AudioSegment
from moviepy.editor import VideoFileClip
import os
import time

def convert_to_wav(input_path: str, output_dir: str = "converted") -> str:
    # 지원되는 음성 또는 동영상 파일을 WAV 형식으로 변환
    supported_audio_formats = [".wav", ".mp3", ".m4a", ".flac", ".ogg", ".aac"]
    supported_video_formats = [".mp4", ".mkv", ".mov", ".avi", ".wmv"]
    
    file_ext = os.path.splitext(input_path)[1].lower()
    
    # 출력 디렉토리 생성
    os.makedirs(output_dir, exist_ok=True)
    
    # WAV 파일인 경우 바로 반환
    if file_ext == ".wav":
        print(f"[INFO] 입력 파일이 이미 WAV 형식입니다: {input_path}")
        return input_path
    
    output_path = os.path.join(output_dir, os.path.basename(input_path).replace(file_ext, ".wav"))
    
    if file_ext in supported_audio_formats:
        print(f"[INFO] {file_ext} 오디오 파일을 WAV로 변환 중...")
        audio = AudioSegment.from_file(input_path)
        audio = audio.set_frame_rate(16000)  # 16kHz로 샘플링 레이트 조정
        audio.export(output_path, format="wav")
    elif file_ext in supported_video_formats:
        print(f"[INFO] {file_ext} 동영상 파일에서 오디오 추출 중...")
        video = VideoFileClip(input_path)
        video.audio.write_audiofile(output_path, codec="pcm_s16le", fps=16000)
    else:
        raise ValueError(f"지원되지 않는 파일 형식: {file_ext}")
    
    print(f"[INFO] 변환 완료: {output_path}")
    return output_path

def main():
    # Hugging Face 토큰 설정
    auth_token = ""  # 여기에 실제 토큰 입력
    
    # 입력 파일 설정 (지원 형식: wav, mp3, m4a, flac, ogg, aac, mp4, mkv, mov, avi, wmv)
    input_file = ""  # 테스트할 파일 경로
    
    try:
        # 시작 시간 기록
        start_time = time.time()
        
        # 파일 변환
        wav_file = convert_to_wav(input_file)
        
        # 화자 분리 파이프라인 초기화
        print("[INFO] 화자 분리 모델 로드 중...")
        pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            use_auth_token=auth_token
        )
        
        import torch
        pipeline.to(torch.device("mps"))

        print("[INFO] 화자 분리 수행 중...")
        diarization = pipeline(wav_file)

        # 화자별 구간 저장
        speakers = {}
        for turn, _, speaker in diarization.itertracks(yield_label=True):
            if speaker not in speakers:
                speakers[speaker] = []
            speakers[speaker].append([turn.start, turn.end])
            print(f"start={turn.start:.1f}s stop={turn.end:.1f}s speaker_{speaker}")

        # 원본 오디오 로드
        audio = AudioSegment.from_file(wav_file, format="wav")

        # 출력 폴더 생성
        output_folder = "output"
        os.makedirs(output_folder, exist_ok=True)

        # 화자별 오디오 추출 및 저장
        speaker_index = 0
        for speaker_label, segments in speakers.items():
            for i, (start, end) in enumerate(segments):
                if (end - start) > 1:  # 1초 이상 구간만 저장
                    segment = audio[int(start*1000):int(end*1000)]
                    segment.export(
                        os.path.join(output_folder, f"speaker_{speaker_index}_{i}.wav"), 
                        format="wav"
                    )
            speaker_index += 1

        print("[INFO] 화자 분리 완료!")

        # 종료 시간 기록 및 실행 시간 출력
        end_time = time.time()
        elapsed_time = end_time - start_time
        print(f"[INFO] 전체 실행 시간: {elapsed_time:.2f}초")

    except Exception as e:
        print(f"[ERROR] 오류 발생: {str(e)}")

if __name__ == "__main__":
    main()
