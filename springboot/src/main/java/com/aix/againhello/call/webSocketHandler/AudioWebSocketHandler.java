package com.aix.againhello.call.webSocketHandler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.websocket.OnMessage;
import jakarta.websocket.Session;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.nio.ByteBuffer;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


@Component
public class AudioWebSocketHandler extends BinaryWebSocketHandler implements WebSocketHandler {

    private static FastApiWebSocketClient fastApiClient;
    // 오디오 버퍼링을 위한 Map (세션별로 저장)
    private final Map<String, ByteArrayOutputStream> sessionAudioBuffers = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception{

        String userEmail = (String) session.getAttributes().get("userEmail");

        if (userEmail == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Unauthorized"));
            return;
        }
        System.out.println("[웹소켓] 인증된 사용자 WebSocket 연결: " + userEmail);
        System.out.println("[웹소켓] 클라이언트 연결됨 sessionID: " + session.getId());

        try {
            if (fastApiClient == null || !fastApiClient.isOpen()) {
                fastApiClient = new FastApiWebSocketClient(new URI("ws://localhost:8000/be/ws/python"));
                fastApiClient.connectBlocking();
                System.out.println("[FastAPI 연결 성공]");
            }
        } catch (Exception e) {
            System.err.println("FastAPI 연결 실패: " + e.getMessage());
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message){
        System.out.println("[웹소켓] 텍스트 메시지 수신됨: " + message.getPayload());
        String payload = message.getPayload();

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(payload);  // JSON 트리로 파싱

            String event = root.path("event").asText(null);
            String type = root.path("type").asText(null);

            System.out.println("[event]: " + event + " / [type]: " + type);

            if ("end".equals(event)) {
                System.out.println("클라이언트가 STT 종료 요청");
                fastApiClient.send("{\"event\":\"end\"}");
            }

            if ("stt_end".equals(type)) {
                System.out.println("React로 STT 종료 알림 전송");
                session.sendMessage(new TextMessage("{\"type\": \"stt_end\"}"));
            }

            if ("tts_start".equals(type)) {
                System.out.println("TTS 시작");
                session.sendMessage(new TextMessage("{\"type\": \"tts_start\"}"));
            }

            if ("tts_end".equals(type)) {
                System.out.println("TTS 종료 → 오디오 클립 React로 전송");
                ByteArrayOutputStream audioStream = sessionAudioBuffers.remove(session.getId());
                byte[] fullAudio = audioStream.toByteArray();
                sendToReactClient(session, fullAudio);
            }

        } catch (Exception e) {
            System.err.println("[Spring] JSON 파싱 실패: " + e.getMessage());
        }
    }

    private void sendToReactClient(WebSocketSession session, byte[] audioBytes) throws IOException {
        session.sendMessage(new BinaryMessage(audioBytes));
        System.out.println("React로 WebM 오디오 바이너리 전송 완료");
    }


    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) throws Exception {
        ByteBuffer buffer = message.getPayload();
        byte[] audioBytes = new byte[buffer.remaining()];
        buffer.get(audioBytes);

        if (session.getUri().toString().contains("be/ws/react")) {
            if (fastApiClient != null && fastApiClient.isOpen()) {
                fastApiClient.send(audioBytes);
            }
//            System.out.println("React → Python 오디오 전달");
        } else if (session.getUri().toString().contains("be/ws/python")) {
            ByteArrayOutputStream streamBuffer = sessionAudioBuffers.get(session.getId());
            if (streamBuffer != null) {
                streamBuffer.write(audioBytes);
                System.out.println("Python → React 오디오 저장 (chunk 크기: " + audioBytes.length + ")");
            }
        }
    }


    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        System.out.println("[웹소켓] 연결 종료 sessionID: " + session.getId());
        if (fastApiClient != null && fastApiClient.isOpen()) {
            fastApiClient.close();
        }
    }
}
