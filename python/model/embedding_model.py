from sentence_transformers import SentenceTransformer

# 서버 시작 시 로드 (한 번만 실행됨)
embedding_model = SentenceTransformer("intfloat/multilingual-e5-base")