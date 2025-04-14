from langchain_core.runnables import RunnableWithMessageHistory
from llm.chat.chat_history import YourPostgresChatMessageHistory 

class MyChatChain:
    def __init__(self, base_chain, deceased_code_map: dict):
        self.deceased_code_map = deceased_code_map
        self.chain = RunnableWithMessageHistory(
            runnable=base_chain, # This will be the dynamically created chain
            get_session_history=self.get_memory,
            input_messages_key="input",
            # Make sure this matches the MessagesPlaceholder variable_name
            history_messages_key="messages"
        )

    def get_memory(self, session_id):
        # Convert session_id to int for lookup if necessary, handle potential errors
        try:
            session_id_int = int(session_id)
        except ValueError:
            raise ValueError(f"Invalid session_id format, expected integer representable string: {session_id}")

        print("session_id in get_memory:", session_id) # Keep as original type if history class expects string
        deceased_code = self.deceased_code_map.get(session_id_int)

        if deceased_code is None: # Check explicitly for None
            # Log the map content for debugging if a key is missing
            print(f"Debug: deceased_code_map content: {self.deceased_code_map}")
            raise ValueError(f"deceased_code not found for session_id: {session_id} (int: {session_id_int})")
        else:
            print("deceased_code:", deceased_code)

        # Pass session_id as string if YourPostgresChatMessageHistory expects it
        return YourPostgresChatMessageHistory(
            session_id=str(session_id),
            deceased_code=deceased_code
        )

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
    

    