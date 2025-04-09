from langchain_core.runnables import RunnableWithMessageHistory
from llm.chat_history import YourPostgresChatMessageHistory  # 직접 구현한 memory

# class MyChatChain(RunnableWithMessageHistory):
#     def __init__(self, chain):
#         self.inner_runnable = chain

#     def get_chat_message_history(self, session_id, inputs):
#         return YourPostgresChatMessageHistory(session_id)

class MyChatChain:
    def __init__(self, base_chain, deceased_code_map: dict):
        self.deceased_code_map = deceased_code_map

        self.chain = RunnableWithMessageHistory(
            runnable=base_chain,
            get_session_history=self.get_memory,
            input_messages_key="input",
            history_messages_key="messages"
        )

    def get_memory(self, session_id):
        print("🔍 session_id in get_memory:", session_id)

        deceased_code = self.deceased_code_map.get(int(session_id))
        if not deceased_code:
            raise ValueError(f"deceased_code not found for session_id: {session_id}")
        else: print("🔍 deceased_code:", deceased_code)

        return YourPostgresChatMessageHistory(
            session_id=session_id,
            deceased_code=deceased_code
        )

    def invoke(self, inputs, config=None):
        return self.chain.invoke(inputs, config=config)
    

    