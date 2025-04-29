import psycopg2
from psycopg2.extras import RealDictCursor
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from tqdm import tqdm
from db.postgresql_connector import get_db_connection

# 1. 한국어 감정분석 모델 로드
model_name = "tabularisai/multilingual-sentiment-analysis"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# 2. 감정 라벨 맵 (공식 문서 기준)
sentiment_map = {
    0: "매우 부정",   # Very Negative
    1: "부정",       # Negative
    2: "중립",       # Neutral
    3: "긍정",       # Positive
    4: "매우 긍정"   # Very Positive
}

# 3. 감정분석 및 DB 저장
def analyze_and_save_emotions(batch_size=32):
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # 감정분석이 안 된 대화만 추출
            cur.execute("SELECT code, content FROM contents WHERE emotion IS NULL")
            rows = cur.fetchall()
            print(f"분석할 대화 건수: {len(rows)}")

            for i in tqdm(range(0, len(rows), batch_size)):
                batch = rows[i:i+batch_size]
                texts = [row['content'] for row in batch]
                codes = [row['code'] for row in batch]

                # 토크나이즈 및 모델 추론
                inputs = tokenizer(texts, return_tensors="pt", truncation=True, padding=True, max_length=512)
                with torch.no_grad():
                    outputs = model(**inputs)
                    probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
                    preds = torch.argmax(probs, dim=-1).tolist()

                # DB에 감정 결과 저장 (한글로 변환)
                for code, pred in zip(codes, preds):
                    emotion = sentiment_map.get(pred, "중립")
                    cur.execute(
                        "UPDATE contents SET emotion=%s WHERE code=%s",
                        (emotion, code)
                    )
                conn.commit()
    print("감정분석 및 DB 저장 완료!")

if __name__ == "__main__":
    analyze_and_save_emotions()