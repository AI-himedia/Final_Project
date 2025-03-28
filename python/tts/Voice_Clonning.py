import torch
import torchaudio
from speechbrain.inference.speaker import EncoderClassifier
def extract_embedding(audio_path: str):
    """
    주어진 오디오 파일에서 임베딩을 추출하는 함수
    """
    # 사전 훈련된 ECAPA-TDNN 모델 로드
    classifier = EncoderClassifier.from_hparams(
        source="speechbrain/spkrec-ecapa-voxceleb",
        run_opts={"device": "cuda" if torch.cuda.is_available() else "cpu"}
    )
    # 오디오 파일 로드 및 전처리
    signal, fs = torchaudio.load(audio_path)
    # 다중 채널을 단일 채널로 변환 (모노)
    if signal.shape[0] > 1:  # 다중 채널인지 확인
        signal = torch.mean(signal, dim=0, keepdim=True)
    if fs != 16000:
        transform = torchaudio.transforms.Resample(orig_freq=fs, new_freq=16000)
        signal = transform(signal)
    # 임베딩 추출
    embeddings = classifier.encode_batch(signal)
    return embeddings.squeeze().cpu().numpy()
if __name__ == "__main__":
    audio_file = r"C:\Users\201-03\Desktop\wav\smple.wav"  # 원하는 오디오 파일 경로 입력
    embedding = extract_embedding(audio_file)
    print("Extracted Embedding:", embedding)