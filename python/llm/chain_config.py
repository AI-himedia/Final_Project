import os
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_perplexity import ChatPerplexity
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder

MODEL_LLMS = {
    "openai": ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.5,
        # max_tokens=None, # Default: No limit or model's max
        verbose=True # For LangChain callbacks
    ),
    "claude": ChatAnthropic(
        model="claude-3-7-sonnet-20250219",
        # max_tokens=200, 
        temperature=0.4,
    ),
    "sonar": ChatPerplexity(
        model="sonar",
        temperature=0.4,
        # max_tokens=1024, 
    )
}

prompt = ChatPromptTemplate.from_messages([
    ("system", "{system_prompt}"), 
    MessagesPlaceholder(variable_name="messages"), # Placeholder for chat history
    ("human", "{input}") 
])

# --- Function to get LLM and Prompt ---
def get_llm_and_prompt(model_choice: str):
    """
    Selects the LLM instance based on the model_choice.
    Returns the selected LLM and the common prompt template.
    """
    llm = MODEL_LLMS.get(model_choice.lower())
    if not llm:
        raise ValueError(f"Unsupported model choice: {model_choice}. Choose from {list(MODEL_LLMS.keys())}")

    # In this setup, we use the same prompt structure for all models.
    # If drastically different prompts were needed, this function could
    # also return a model-specific prompt object.
    return llm, prompt

## 남준님 코드

# prompt = ChatPromptTemplate.from_template("""
# {system_prompt}

# {messages}

# User: {input}
# """)


# llm = ChatOpenAI(model="gpt-4o-mini", verbose=True)
# base_chain = prompt | llm


# 변경 코드
# prompt_from_messages = ChatPromptTemplate.from_messages([
#     # 1. 시스템 프롬프트 (SystemMessage 역할)
#     ("system", "{system_prompt}"),

#     # 2. 이전 대화 내역을 위한 플레이스홀더
#     MessagesPlaceholder(variable_name="chat_history"), # history 메시지 전달 위치

#     # 3. 현재 사용자 입력 (HumanMessage 역할)
#     ("human", "{input}") # 'input' 키로 현재 사용자 메시지 내용이 전달될 것을 예상
# ])