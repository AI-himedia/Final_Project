from openai import OpenAI
from dotenv import load_dotenv
import openai

# .env 로드
load_dotenv()

# openai.api_key = os.environ["OPENAI_API_KEY"]
client = openai.OpenAI()


def run_analysis(messages: list) -> str:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.7
    )
    return response.choices[0].message.content
