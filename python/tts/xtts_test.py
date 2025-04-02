import torch
from TTS.utils.manage import ModelManager
from TTS.utils.generic_utils import get_user_data_dir
from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import Xtts
import os
import re
import torchaudio

# 모델 직접 초기화 및 체크포인트를 로드
# 세부 설정 직접 제어 및 특정 기능 추가/수정 가능

# 모델 로드
def load_model(model_name):
    ModelManager().download_model(model_name)

    model_path = os.path.join(get_user_data_dir("tts"), model_name.replace("/", "--"))

    config = XttsConfig()
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
def create_star_vector(model, speech_file):
    speaker_wav = speech_file
    gpt_cond_latent = None
    speaker_embedding = None

    try:
        (gpt_cond_latent, speaker_embedding) = model.get_conditioning_latents(
            audio_path=speaker_wav, gpt_cond_len=30, gpt_cond_chunk_len=4, max_ref_length=60
        )
    except Exception as e:
        print("Speaker encoding error", str(e))

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
        speaker_embedding,
        repetition_penalty=5.0,
        temperature=0.75,
        speed=1,
    )
    res = torch.tensor(out["wav"]).unsqueeze(0)
    return res

# 예시 사용
speaker_wav = "" # 음성 파일 경로
gpt_cond_latent, speaker_embedding = create_star_vector(model, speaker_wav)

text = "오늘 많이 피곤했겠다~ 얼른 집에 들어가서 씻고 푹 쉬어!"
audio_tensor = inference(model, text, gpt_cond_latent, speaker_embedding)

if audio_tensor is not None:
    # 결과를 WAV 파일로 저장
    torchaudio.save("final/output1.wav", audio_tensor, sample_rate=24000)
