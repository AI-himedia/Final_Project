import redis
import json
from postgresql_chat_message_history import YourPostgresChatMessageHistory

class RedisChatMessageHistory:
    def __init__(self, session_id: str, redis_client: redis.Redis):
        self.session_id = session_id
        self.redis_client = redis_client  # Redis 클라이언트

    @property
    def messages(self):
        conversation_key = f"conversation:{self.session_id}"
        
        # Redis에서 대화록 조회
        conversation_data = self.redis_client.lrange(conversation_key, 0, -1)
        
        if conversation_data:
            # Redis에 데이터가 있으면 바로 반환
            print("[DEBUG] Found chat history in Redis.")
            return [json.loads(msg.decode('utf-8')) for msg in conversation_data]
        
        # Redis에 데이터가 없으면 DB에서 조회
        print("[DEBUG] Redis cache is empty. Fetching from PostgreSQL.")
        # Redis에 없으면 PostgreSQL에서 데이터 조회 후 Redis에 저장
        postgres_history = YourPostgresChatMessageHistory(self.session_id, self.deceased_code).messages
        for msg in postgres_history:
            self.redis_client.rpush(conversation_key, json.dumps({"role": msg.type, "content": msg.content}))
        
        return postgres_history

    def store_message(self, user_input: str, ai_response: str):
        conversation_key = f"conversation:{self.session_id}"

        # Redis에 user_input과 ai_response 추가
        self.redis_client.rpush(conversation_key, json.dumps({"role": "user", "content": user_input}))
        self.redis_client.rpush(conversation_key, json.dumps({"role": "ai", "content": ai_response}))

        # Redis 리스트의 길이를 10개로 제한
        self.redis_client.ltrim(conversation_key, -10, -1)

        # PostgreSQL에 대화 기록 저장
        # store_conversation_in_db(self.session_id, user_input, ai_response)

    def clear(self):
        conversation_key = f"conversation:{self.session_id}"
        # Redis에서 해당 session_id의 대화록 삭제
        self.redis_client.delete(conversation_key)
