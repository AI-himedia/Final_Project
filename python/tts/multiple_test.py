import torch
from TTS.utils.manage import ModelManager
from TTS.utils.generic_utils import get_user_data_dir
from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import Xtts
from TTS.tts.models.xtts import XttsArgs
import os
import re
import torchaudio

# 모델 직접 초기화 및 체크포인트를 로드
# 세부 설정 직접 제어 및 특정 기능 추가/수정 가능

# 모델 로드
def load_model(model_name):
    ModelManager().download_model(model_name)

    model_path = os.path.join(get_user_data_dir("tts"), model_name.replace("/", "--"))

    # XttsConfig
    config = XttsConfig(
        temperature=0.7,  # 창의성을 높이기 위해
        repetition_penalty=6.0,  # 반복을 줄이기 위해
        sound_norm_refs=True,  # 오디오 정규화
    )
    config.load_json(os.path.join(model_path, "config.json"))

    model = Xtts.init_from_config(config)
    model.load_checkpoint(
        config,
        checkpoint_path=os.path.join(model_path, "model.pth"),
        vocab_path=os.path.join(model_path, "vocab.json"),
        speaker_file_path=os.path.join(model_path, "speakers_xtts.json"),
        eval=True,
        use_deepspeed=False,
    )
    return model

# 모델 초기화
model_name = "tts_models/multilingual/multi-dataset/xtts_v2"
model = load_model(model_name)

# 음성 클로닝
def compute_speaker_latents(model, speech_files):
    speaker_embeddings = []
    gpt_cond_latents = []

    for speech_file in speech_files:
        gpt_cond_latent = None
        speaker_embedding = None

        try:
            (gpt_cond_latent, speaker_embedding) = model.get_conditioning_latents(
                audio_path=speech_file, gpt_cond_len=30, gpt_cond_chunk_len=4, max_ref_length=60
            )
        except Exception as e:
            print("Speaker encoding error", str(e))

        speaker_embeddings.append(speaker_embedding)
        gpt_cond_latents.append(gpt_cond_latent)

    # 여러 speaker embedding을 평균으로 결합
    speaker_embedding = torch.mean(torch.stack(speaker_embeddings), dim=0)
    gpt_cond_latent = torch.mean(torch.stack(gpt_cond_latents), dim=0)

    return gpt_cond_latent, speaker_embedding

# TTS
def inference(model, text, gpt_cond_latent, speaker_embedding):
    if gpt_cond_latent is None or speaker_embedding is None:
        print("Error: Speaker encoding failed.")
        return None

    prompt = text
    # 구두점 앞뒤에 공백 추가 (음성 합성 시 자연스러운 발음)
    prompt = re.sub("([^\x00-\x7F]|\w)(\.|\。|\?)", r"\1 \2\2", prompt)

    out = model.inference(
        prompt,
        "ko",
        gpt_cond_latent,
        speaker_embedding
    )
    res = torch.tensor(out["wav"]).unsqueeze(0)
    return res

# 예시 사용
speaker_wavs = [
]  # 여러 음성 파일 경로

gpt_cond_latent, speaker_embedding = compute_speaker_latents(model, speaker_wavs)

text = ""
audio_tensor = inference(model, text, gpt_cond_latent, speaker_embedding)

if audio_tensor is not None:
    # 결과를 WAV 파일로 저장
    torchaudio.save("final/output.wav", audio_tensor, sample_rate=24000)
