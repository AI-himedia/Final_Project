from db.query_utils import update_deceased_data, insert_deceased_data, update_subscription, insert_raw_file

#  DeceasedData 에 deceasedCode 있는지 확인
#  deceasedCode  있으면 UPDATE 없으면 INSERT 해서 pk(deceasedCode) 받기
#  subscription 에 새로 받은 pk(deceasedCode) UPDATE
#  rawFile 에 새로 받은 url INSERT


def save_all_to_db(subscription_code, deceased_data, chat_urls):
    deceased_code = upsert_deceased_data(deceased_data)

    # 새로 INSERT된 경우만 subscription 업데이트
    if not deceased_data.get("deceased_code"):
        update_subscription(subscription_code, deceased_code)
    insert_raw_file(subscription_code, chat_urls)


def upsert_deceased_data(deceased_data) -> int:
    # 이미 있는 경우(UPDATE, 정보 수정)
    if deceased_data.get("deceased_code"):  
        update_deceased_data(deceased_data)
        return deceased_data["deceased_code"]
    else:  # 새로 INSERT
        return insert_deceased_data(deceased_data)

