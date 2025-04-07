from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "{system_prompt}"),
    ("user", "{input}")
])

llm = ChatOpenAI(model="gpt-4o-mini")
base_chain = prompt | llm
