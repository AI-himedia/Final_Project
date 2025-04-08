from langchain_core.runnables import RunnableWithMessageHistory
from llm.chat_history import YourPostgresChatMessageHistory  # 직접 구현한 memory

class MyChatChain(RunnableWithMessageHistory):
    def __init__(self, chain):
        self.inner_runnable = chain

    def get_chat_message_history(self, session_id, inputs):
        return YourPostgresChatMessageHistory(session_id)
