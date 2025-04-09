from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import HumanMessage, AIMessage
from db.postgresql_connector import get_db_connection

class YourPostgresChatMessageHistory(BaseChatMessageHistory):
    def __init__(self, session_id: str):
        self.session_id = session_id  # 예: "sms-123"
        self.subscription_code = int(session_id)
        self.conn = get_db_connection()

    # def add_user_message(self, message: str) -> None:
    #     with self.conn.cursor() as cur:
    #         cur.execute("""
    #             INSERT INTO contents (subscription_code, role, message_time, content)
    #             VALUES (%s, 'user', NOW(), %s)
    #         """, (self.subscription_code, message))
    #         self.conn.commit()

    # def add_ai_message(self, message: str) -> None:
    #     with self.conn.cursor() as cur:
    #         cur.execute("""
    #             INSERT INTO contents (subscription_code, role, message_time, content)
    #             VALUES (%s, 'ai', NOW(), %s)
    #         """, (self.subscription_code, message))
    #         self.conn.commit()

    @property
    def messages(self):
        with self.conn.cursor() as cur:
            cur.execute("""
            SELECT role, content
            FROM contents
            WHERE deceased_code = (
                SELECT deceased_code
                FROM subscription
                WHERE subscription_code = %s
            )
            ORDER BY message_time ASC
        """, (self.subscription_code,))
            rows = cur.fetchall()

        message_objs = []
        for role, content in rows:
            if role == 'user':
                message_objs.append(HumanMessage(content=content))
            else:
                message_objs.append(AIMessage(content=content))
        return message_objs
