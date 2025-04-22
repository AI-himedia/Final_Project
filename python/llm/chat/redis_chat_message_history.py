import redis
import json
from typing import Optional, List
from langchain_core.messages import HumanMessage, AIMessage
from llm.chat.postgresql_chat_message_history import YourPostgresChatMessageHistory
from db.query_utils import add_messages

MAX_CONVERSATION_COUNT = 10
TTL = 3600  # TTL 설정 (예: 1시간)


class RedisChatMessageHistory:
    def __init__(self, session_id: str, deceased_code, redis_client: redis.Redis):
        self.session_id = session_id
        self.deceased_code = deceased_code
        self.redis_client = redis_client  # Redis 클라이언트

    @property
    def messages(self):
        # 실제 conversation_key에 들어가는 value 예시 : "conversation:123"
        conversation_key = f"conversation:{self.session_id}"
        
        # Redis에서 대화록 조회
        # Redis에서 리스트 자료형의 특정 범위를 조회하는 명령어
        # conversation_key**에 해당하는 리스트의 모든 데이터를 조회
        # 예시 Redis 리스트 데이터 (리스트 자료형)
        # conversation:123 = ["message1", "message2", "message3", "message4", "message5"]
        conversation_data = self.redis_client.lrange(conversation_key, 0, -1)
        print(f"[DEBUG] conversation_data: {conversation_data}")

        if conversation_data:
            # Redis에 데이터가 있으면 바로 반환
            print("[DEBUG] Found chat history in Redis.")

            # message_objs[]에 HumanMessage와 AIMessage 객체를 순서대로 추가
            message_objs = []
            for msg in [json.loads(msg.decode('utf-8')) for msg in conversation_data]:
                if msg['role'] == 'user':
                    message_objs.append(HumanMessage(content=msg['content']))
                else:
                    message_objs.append(AIMessage(content=msg['content']))

            print(f"[DEBUG] message_objs: {message_objs}")
            return message_objs


        # Redis에 데이터가 없으면 DB에서 조회
        print("[DEBUG] Redis cache is empty. Fetching from PostgreSQL.")
        # Redis에서 해당 세션 대화록 삭제 (초기화)(중복 데이터 방지)
        self.redis_client.delete(conversation_key)

        # Redis에 없으면 PostgreSQL에서 데이터 조회 후 Redis에 저장
        postgres_history = YourPostgresChatMessageHistory(self.session_id, self.deceased_code).messages
        for msg in postgres_history:
            self.redis_client.rpush(conversation_key, json.dumps({"role": msg.type, "content": msg.content}))
            self.redis_client.ltrim(conversation_key, -MAX_CONVERSATION_COUNT, -1)
            self.redis_client.expire(conversation_key, TTL)

        print(f"[DEBUG] postgres_history: {postgres_history}")
        
        return postgres_history

    def store_message(
        self, 
        subscription_code: int, 
        deceased_code: int, 
        service_type: str,
        user_input: str, 
        ai_response: str, 
        user_embedding: Optional[List[float]] = None, 
        ai_embedding: Optional[List[float]] = None,
        model_version: Optional[str] = None
    ):
        conversation_key = f"conversation:{self.session_id}"

        # Redis에 user_input과 ai_response 추가
        self.redis_client.rpush(conversation_key, json.dumps({"role": "user", "content": user_input}))
        self.redis_client.rpush(conversation_key, json.dumps({"role": "ai", "content": ai_response}))

        # Redis 리스트의 길이를 10개로 제한
        self.redis_client.ltrim(conversation_key, -MAX_CONVERSATION_COUNT, -1)
        self.redis_client.expire(conversation_key, TTL)

        print(f"[DEBUG] redis 저장: {len(self.redis_client.lrange(conversation_key, 0, -1))}")


        print(f"[DEBUG] embedding_type: {type(user_embedding)}")
        print(f"[DEBUG] embedding_type: {type(ai_embedding)}")


        # PostgreSQL에 대화 기록 저장
        add_messages(
            subscription_code=subscription_code, 
            deceased_code=deceased_code,
            service_type=service_type,
            messages=[
                ("user", user_input),
                ("ai", ai_response)
            ],
            embeddings=[
                user_embedding,
                ai_embedding
            ] if user_embedding and ai_embedding else None,
            model_version=model_version
        ),
            

    def clear(self):
        conversation_key = f"conversation:{self.session_id}"
        # Redis에서 해당 session_id의 대화록 삭제
        deleted = self.redis_client.delete(conversation_key)
        if deleted:
            print(f"[DEBUG] Deleted conversation history for session_id: {self.session_id}")
        else:
            print(f"[DEBUG] No conversation history found to delete for session_id: {self.session_id}")

