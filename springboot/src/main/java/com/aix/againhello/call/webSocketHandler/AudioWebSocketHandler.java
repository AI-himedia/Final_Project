package com.aix.againhello.call.webSocketHandler;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.ByteBuffer;


@Component
public class AudioWebSocketHandler extends BinaryWebSocketHandler implements WebSocketHandler {

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception{
        String userEmail = (String) session.getAttributes().get("userEmail");
        if (userEmail == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Unauthorized"));
            return;
        }
        System.out.println("[웹소켓] 인증된 사용자 WebSocket 연결: " + userEmail);
        System.out.println("[웹소켓] 클라이언트 연결됨 sessionID: " + session.getId());
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) throws Exception {
        ByteBuffer buffer = message.getPayload();
        byte[] audioBytes  = new byte[buffer.remaining()];
        buffer.get(audioBytes);

        System.out.println("[웹소켓] 오디오 수신" +audioBytes.length + " bytes");
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        System.out.println("[웹소켓] 연결 종료 sessionID: " + session.getId());
    }
}
