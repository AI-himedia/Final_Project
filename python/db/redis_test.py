import redis

# Redis 클라이언트 연결
r = redis.Redis(host='localhost', port=6379, db=0)

# Redis에 데이터 저장
r.set('my_key', 'Hello, Redis!')

# Redis에서 데이터 조회
value = r.get('my_key')
print(value.decode('utf-8'))  # 출력: Hello, Redis!

r.delete('my_key')
value = r.get('my_key')
print(f"after_delete : value")
