from langchain_core.runnables import RunnableWithMessageHistory
from llm.chat.redis_chat_message_history import RedisChatMessageHistory
import redis

class MyChatChain:
    def __init__(self, base_chain, deceased_code_map: dict, redis_client: redis.Redis):
        self.deceased_code_map = deceased_code_map
        self.redis_client = redis_client  # Redis 클라이언트를 여기서 저장
        self.chat_history_instance = None      # Redis + DB 저장을 위한 메시지 기록 관리 객체
        self.session_id_cache = None

        self.chain = RunnableWithMessageHistory(
            runnable=base_chain, # 동적으로 생성된 체인을 이곳에 설정
            get_session_history=self.get_memory,
            input_messages_key="input",
            # MessagesPlaceholder 변수 이름과 일치하도록 설정
            history_messages_key="messages"
        )

    def get_memory(self, session_id):
        # 중복 호출 방지
        if self.chat_history_instance and self.session_id_cache == session_id:
            return self.chat_history_instance.messages

        # session_id를 int로 변환하여 조회하도록 처리, 변환 실패시 예외 처리
        try:
            session_id_int = int(session_id)
        except ValueError:
            raise ValueError(f"Invalid session_id format, expected integer representable string: {session_id}")

        print("session_id in get_memory:", session_id)
        deceased_code = self.deceased_code_map.get(session_id_int)

        if deceased_code is None: # None에 대한 명시적 확인
            # 키가 누락된 경우, 맵 내용 로그로 디버깅
            print(f"Debug: deceased_code_map content: {self.deceased_code_map}")
            raise ValueError(f"deceased_code not found for session_id: {session_id} (int: {session_id_int})")
        else:
            print("deceased_code:", deceased_code)

        
        # RedisChatMessageHistory를 사용하여 Redis에서 대화 이력 조회
        self.chat_history_instance = RedisChatMessageHistory(session_id, deceased_code, self.redis_client)
        self.session_id_cache = session_id
        
        # Redis에서 대화 기록을 조회하여 반환
        return self.chat_history_instance
        # # YourPostgresChatMessageHistory가 session_id를 문자열로 기대하는 경우 문자열로 전달
        # return YourPostgresChatMessageHistory(
        #     session_id=str(session_id),
        #     deceased_code=deceased_code
        # )

    def invoke(self, inputs, config=None):
        print(f"Invoking chain with inputs: {inputs.keys()}, config: {config}")
        return self.chain.invoke(inputs, config=config)

# from langchain_core.runnables import RunnableWithMessageHistory
# from llm.chat_history import YourPostgresChatMessageHistory  # 직접 구현한 memory

# # class MyChatChain(RunnableWithMessageHistory):
# #     def __init__(self, chain):
# #         self.inner_runnable = chain

# #     def get_chat_message_history(self, session_id, inputs):
# #         return YourPostgresChatMessageHistory(session_id)

# class MyChatChain:
#     def __init__(self, base_chain, deceased_code_map: dict):
#         self.deceased_code_map = deceased_code_map

#         self.chain = RunnableWithMessageHistory(
#             runnable=base_chain,
#             get_session_history=self.get_memory,
#             input_messages_key="input",
#             history_messages_key="messages"
#         )

#     def get_memory(self, session_id):
#         print("session_id in get_memory:", session_id)

#         deceased_code = self.deceased_code_map.get(int(session_id))
#         if not deceased_code:
#             raise ValueError(f"deceased_code not found for session_id: {session_id}")
#         else: print("deceased_code:", deceased_code)

#         return YourPostgresChatMessageHistory(
#             session_id=session_id,
#             deceased_code=deceased_code
#         )

#     def invoke(self, inputs, config=None):
#         return self.chain.invoke(inputs, config=config)
    

    