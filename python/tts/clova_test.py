import requests
import json
import os
from pydub import AudioSegment

class ClovaSpeechClient:
    # Clova Speech invoke URL
    invoke_url = ''
    # Clova Speech secret key
    secret = ''

    def req_url(self, url, completion, callback=None, userdata=None, forbiddens=None, boostings=None, wordAlignment=True, fullText=True, diarization=None):
        request_body = {
            'url': url,
            'language': 'ko-KR',
            'completion': completion,
            'callback': callback,
            'userdata': userdata,
            'wordAlignment': wordAlignment,
            'fullText': fullText,
            'forbiddens': forbiddens,
            'boostings': boostings,
            'diarization': diarization,
        }
        headers = {
            'Accept': 'application/json;UTF-8',
            'Content-Type': 'application/json;UTF-8',
            'X-CLOVASPEECH-API-KEY': self.secret
        }
        return requests.post(headers=headers,
                             url=self.invoke_url + '/recognizer/url',
                             data=json.dumps(request_body).encode('UTF-8'))

    def req_object_storage(self, data_key, completion, callback=None, userdata=None, forbiddens=None, boostings=None,
                           wordAlignment=True, fullText=True, diarization=None):
        request_body = {
            'dataKey': data_key,
            'language': 'ko-KR',
            'completion': completion,
            'callback': callback,
            'userdata': userdata,
            'wordAlignment': wordAlignment,
            'fullText': fullText,
            'forbiddens': forbiddens,
            'boostings': boostings,
            'diarization': diarization,
        }
        headers = {
            'Accept': 'application/json;UTF-8',
            'Content-Type': 'application/json;UTF-8',
            'X-CLOVASPEECH-API-KEY': self.secret
        }
        return requests.post(headers=headers,
                             url=self.invoke_url + '/recognizer/object-storage',
                             data=json.dumps(request_body).encode('UTF-8'))

    def req_upload(self, file):
        request_body = {
            'language': 'ko-KR',
            'completion': 'sync',
            'callback': None,
            'userdata': None,
            'wordAlignment': True,
            'fullText': True,
            'forbiddens': None,
            'boostings': None,
            'diarization': {
                'enable': True  # 화자 분리 활성화
            }
        }
        headers = {
            'Accept': 'application/json;UTF-8',
            'X-CLOVASPEECH-API-KEY': self.secret
        }
        # print(json.dumps(request_body, ensure_ascii=False).encode('UTF-8'))
        files = {
            'media': open(file, 'rb'),
            'params': (None, json.dumps(request_body, ensure_ascii=False).encode('UTF-8'), 'application/json')
        }
        response = requests.post(headers=headers, url=self.invoke_url + '/recognizer/upload', files=files)
        return response

def extract_speaker_segments_individually(response_data, audio_file_path):
    # 출력 디렉토리 생성
    output_dir = 'output'
    os.makedirs(output_dir, exist_ok=True)
    
    # 오디오 파일 로드
    audio = AudioSegment.from_file(audio_file_path)
    
    # 세그먼트 데이터 가져오기
    segments = response_data.get('segments', [])
    
    if not segments:
        print("세그먼트 데이터를 찾을 수 없습니다.")
        return
    
    # 첫 번째 세그먼트 구조 확인
    # if segments:
    #     print("첫 번째 세그먼트 구조:", json.dumps(segments[0], indent=2, ensure_ascii=False))
    
    # 각 세그먼트를 개별적으로 처리하여 저장
    for segment_index, segment in enumerate(segments):
        # speaker 정보 추출
        if isinstance(segment.get('speaker'), dict):
            speaker_id = segment['speaker'].get('label', 'unknown')
            speaker_name = segment['speaker'].get('name', f'Speaker_{speaker_id}')
            speaker_key = f"{speaker_id}_{speaker_name}"
        else:
            # speaker가 문자열이거나 다른 형태인 경우
            speaker_key = str(segment.get('speaker', 'unknown'))
        
        # 시간 정보 추출
        start_time = int(float(segment.get('start', 0)))  # 밀리초 단위로 가정
        end_time = int(float(segment.get('end', 0)))  # 밀리초 단위로 가정
        
        # 텍스트 내용 추출 (있는 경우)
        text = segment.get('text', '')
        
        # 세그먼트 추출
        segment_audio = audio[start_time:end_time]
        
        # 파일명 생성 및 저장 - 인덱스 번호 추가하여 순서 유지
        output_file = os.path.join(output_dir, f'speaker_{speaker_key}_{segment_index:03d}_.wav')
        segment_audio.export(output_file, format='wav')
        
        # 진행 상황 출력
        # print(f'세그먼트 {segment_index}: 화자 {speaker_key}, 시간 {start_time}~{end_time}ms')
        # print(f'  - 텍스트: {text}')
        # print(f'  - 저장 위치: {output_file}')

if __name__ == '__main__':
    # res = ClovaSpeechClient().req_url(url='http://example.com/media.mp3', completion='sync')
    # res = ClovaSpeechClient().req_object_storage(data_key='data/media.mp3', completion='sync')
    # res = ClovaSpeechClient().req_upload(file='input/s_call.m4a', completion='sync')
    # print(res.text)

    # 분석할 파일이 있는 폴더 경로
    input_folder = 'input'
    
    # 폴더 내의 오디오 파일 목록 가져오기
    files = os.listdir(input_folder)
    
    # 오디오 파일 필터링 (e.g., .m4a, .mp3, .wav)
    audio_files = [f for f in files if f.endswith(('.m4a', '.mp3', '.wav'))]
    
    # 첫 번째 오디오 파일 선택
    input_file = os.path.join(input_folder, audio_files[0]) if audio_files else None
    
    if input_file:
        # API 클라이언트 초기화
        client = ClovaSpeechClient()
        
        # 음성 인식 및 화자 분리 요청
        print("음성 파일 업로드 및 화자 분리 요청 중...")
        response = client.req_upload(input_file)
    
        # 응답 확인
        if response.status_code == 200:
            try:
                response_data = json.loads(response.text)
                print("API 요청 성공! 화자별 개별 세그먼트 추출 중...")
                extract_speaker_segments_individually(response_data, input_file)
            except Exception as e:
                print(f"응답 처리 중 오류 발생: {str(e)}")
                print("응답 텍스트:", response.text)
        else:
            print(f"API 요청 실패! 상태 코드: {response.status_code}")
            print("응답 텍스트:", response.text)
            print("API URL과 키가 올바르게 설정되었는지 확인하세요.")