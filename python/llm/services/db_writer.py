from db.query_utils import update_deceased_data, insert_deceased_data, update_subscription, insert_raw_file
from llm.models.request_models import DeceasedData

#  DeceasedData 에 deceasedCode 있는지 확인
#  deceasedCode  있으면 UPDATE 없으면 INSERT 해서 pk(deceasedCode) 받기
#  subscription 에 새로 받은 pk(deceasedCode) UPDATE
#  rawFile 에 새로 받은 url INSERT


def save_all_to_db(subscription_code: int, deceased_data: DeceasedData, chat_urls: list[str]):
    deceased_code = upsert_deceased_data(deceased_data)

    # 새로 INSERT된 경우만 subscription 업데이트(고인 데이터 추가/수정 구분)
    if not deceased_data.deceasedCode:
        update_subscription(subscription_code, deceased_code)
    
    if chat_urls:
        insert_raw_file(subscription_code, chat_urls)


def upsert_deceased_data(deceased_data) -> int:
    # 이미 있는 경우(UPDATE, 정보 수정)
    if deceased_data.deceasedCode:  
        update_deceased_data(deceased_data)
        return deceased_data.deceasedCode
    else:  # 새로 INSERT
        return insert_deceased_data(deceased_data)

