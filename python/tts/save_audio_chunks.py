import wave

def save_chunks_to_wav(chunks, filename="received_audio.wav", sample_rate=16000, sample_width=2, channels=1):
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)  # 2 bytes = 16bit
        wf.setframerate(sample_rate)
        wf.writeframes(b''.join(chunks))
    print(f"오디오 저장 완료: {filename}")

def convert_raw_to_wav(raw_path, wav_path, sample_rate=16000):
    with open(raw_path, 'rb') as raw_file:
        raw_data = raw_file.read()

    with wave.open(wav_path, 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(raw_data)
