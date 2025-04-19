from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import HumanMessage, AIMessage
from db.postgresql_connector import get_db_connection

class YourPostgresChatMessageHistory(BaseChatMessageHistory):
    def __init__(self, session_id: str, deceased_code: int):
        self.session_id = session_id  # 예: "sms-123"
        self.subscription_code = int(session_id)
        self.deceased_code = deceased_code

    @property
    def messages(self):
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT role, content
                    FROM contents
                    WHERE deceased_code = %s
                    ORDER BY message_time DESC
                    LIMIT 10
                """, (self.deceased_code,))
                rows = cur.fetchall()
                rows.reverse()  # 시간순 정렬로 되될리기

        message_objs = []
        for role, content in rows:
            if role == 'user':
                message_objs.append(HumanMessage(content=content))
            else:
                message_objs.append(AIMessage(content=content))


         # 로그 찍기!
        print("\n[DEBUG] Chat History Loaded:")
        for m in message_objs:
            print(f"[{m.type.upper()}] {m.content}")

        return message_objs
    
        
    
    def clear(self):
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    DELETE FROM contents
                    WHERE deceased_code = %s
                """, (self.deceased_code,))
                conn.commit()
