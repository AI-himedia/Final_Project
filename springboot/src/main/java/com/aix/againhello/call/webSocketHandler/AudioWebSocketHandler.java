package com.aix.againhello.call.webSocketHandler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;



@Component
public class AudioWebSocketHandler extends BinaryWebSocketHandler implements WebSocketHandler {

    private static FastApiWebSocketClient fastApiClient;
    private final Set<WebSocketSession> connectedReactSessions = ConcurrentHashMap.newKeySet();
    // 오디오 버퍼링을 위한 Map (세션별로 저장)
    private final Map<String, ByteArrayOutputStream> sessionAudioBuffers = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception{

        String userEmail = (String) session.getAttributes().get("userEmail");
        String subscriptionCode = (String) session.getAttributes().get("subscriptionCode");

        if (userEmail == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Unauthorized"));
            return;
        }
        System.out.println("[웹소켓] 사용자 인증 확인. WebSocket 연결");
        System.out.println("[웹소켓] 클라이언트 연결됨 sessionID: " + session.getId());
        System.out.println("[웹소켓] 클라이언트 연결됨 subscriptionCode: " + subscriptionCode);

        connectedReactSessions.add(session);
        System.out.println("React 세션 등록됨: " + session.getId() + " (총 세션 수: " + connectedReactSessions.size() + ")");

        Map<String, String> headers = new HashMap<>();
        headers.put("Origin", "https://againhello.site");


        try {
            if (fastApiClient == null || !fastApiClient.isOpen()) {
                fastApiClient = new FastApiWebSocketClient(new URI("wss://againhello.site/be/ws/python"), headers, subscriptionCode);
                fastApiClient.setMessageRelayCallback(this::relayToReactClients);
                fastApiClient.setBinaryRelayCallback(this::relayBinaryToReactClients);
//                fastApiClient.setConnectionLostTimeout(300);
                fastApiClient.connectBlocking();
                System.out.println("[FastAPI 연결 성공]");
            }
        } catch (Exception e) {
            System.err.println("FastAPI 연결 실패: " + e.getMessage());
        }
    }

    public void relayToReactClients(String message) {
        System.out.println("Python 메시지 React로 전달 시도: " + message);
        for (WebSocketSession session : connectedReactSessions) {
            System.out.println(" - 연결된 세션 ID: " + session.getId() + ", 상태: " + session.isOpen());
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(message));
                    System.out.println(" → 전송 성공");
                } catch (IOException e) {
                    System.err.println(" → 전송 실패: " + e.getMessage());
                }
            }
        }
    }


    public void relayBinaryToReactClients(ByteBuffer buffer) {
        BinaryMessage binaryMessage = new BinaryMessage(buffer);
        for (WebSocketSession session : connectedReactSessions) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(binaryMessage);
                    System.out.println("React로 바이너리 오디오 chunk 전송 완료");
                } catch (IOException e) {
                    System.err.println("React로 바이너리 전송 실패: " + e.getMessage());
                }
            }
        }
    }


    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message){
        System.out.println("텍스트 메시지 수신됨: " + message.getPayload());
        String payload = message.getPayload();

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(payload);  // JSON 트리로 파싱

            String signal = null;
            if (root.has("type")) {
                signal = root.get("type").asText();
            } else if (root.has("event")) {
                signal = root.get("event").asText();
            }

            if (signal == null) {
                System.err.println("올바른 signal(type/event)이 없음");
                return;
            }

            switch (signal) {
                case "end":
                    fastApiClient.send("{\"event\":\"end\"}");
                    System.out.println(" 'end' 메시지 FastAPI로 전송");
                    break;
                case "stt_start":
                    session.sendMessage(new TextMessage("{\"type\": \"stt_end\"}"));
                    System.out.println("React로 STT 종료 알림 전송");
                    break;
                default:
                    System.out.println("Unknown signal received: " + signal);
            }
        } catch (Exception e) {
            System.err.println("JSON 파싱 실패: " + e.getMessage());
        }


//        try {
//            ObjectMapper mapper = new ObjectMapper();
//            JsonNode root = mapper.readTree(payload);  // JSON 트리로 파싱
//
//            String signal = root.path("type").asText();
//            if ("".equals(signal)) {
//                signal = root.path("event").asText();  // fallback
//            }
//
//            if ("end".equals(signal)) {
//                fastApiClient.send("{\"event\":\"end\"}");
//                System.out.println(" 'end' 메시지 FastAPI로 전송");
//            }
//
//            if ("stt_start".equals(signal)) {
//                session.sendMessage(new TextMessage("{\"type\": \"stt_end\"}"));
//                System.out.println("React로 STT 종료 알림 전송");
//            }
//
//        } catch (Exception e) {
//            System.err.println("JSON 파싱 실패: " + e.getMessage());
//        }
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

        if (Objects.requireNonNull(session.getUri()).toString().contains("be/ws/react")) {
            if (fastApiClient != null && fastApiClient.isOpen()) {
                fastApiClient.send(audioBytes);
            }
        } else if (session.getUri().toString().contains("be/ws/python")) {
            relayBinaryToReactClients(buffer);
            System.out.println("Python → React 오디오 전송");
//            // 혹시 TTS 음성 저장할 것이면 사용
//            ByteArrayOutputStream streamBuffer = sessionAudioBuffers.get(session.getId());
//            if (streamBuffer != null) {
//              streamBuffer.write(audioBytes);
//              System.out.println("Python → React 오디오 저장 (chunk 크기: " + audioBytes.length + ")");
//            }
        }
    }


    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        System.out.println("연결 종료 sessionID: " + session.getId());
        connectedReactSessions.remove(session);
        if (connectedReactSessions.isEmpty() && fastApiClient != null && fastApiClient.isOpen()) {
            fastApiClient.close();
        }
    }


}