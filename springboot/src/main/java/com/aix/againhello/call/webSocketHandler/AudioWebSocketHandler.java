package com.aix.againhello.call.webSocketHandler;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;

import java.net.URI;
import java.nio.ByteBuffer;


@Component
public class AudioWebSocketHandler extends BinaryWebSocketHandler implements WebSocketHandler {

    private static FastApiWebSocketClient fastApiClient;

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
                fastApiClient = new FastApiWebSocketClient(new URI("ws://localhost:8000"));
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
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) throws Exception {
//        System.out.println("[웹소켓] BinaryMessage 수신됨! 크기: " + message.getPayloadLength());

        ByteBuffer buffer = message.getPayload();
        byte[] audioBytes = new byte[buffer.remaining()];
        buffer.get(audioBytes);

        System.out.println("fastApiClient is null? " + (fastApiClient == null));
        System.out.println("fastApiClient is open? " + (fastApiClient != null && fastApiClient.isOpen()));


        if (fastApiClient != null && fastApiClient.isOpen()) {
            fastApiClient.send(audioBytes);
            System.out.println("[웹소켓] 오디오 전송" + audioBytes.length);
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
