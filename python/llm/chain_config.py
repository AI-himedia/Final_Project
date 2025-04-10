from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("""
{system_prompt}

{messages}

User: {input}
""")



llm = ChatOpenAI(model="gpt-4o-mini", verbose=True)
base_chain = prompt | llm
