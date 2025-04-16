package com.aix.againhello.call.webSocketHandler;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

public class FastApiWebSocketHandler extends TextWebSocketHandler {

    private WebSocketSession clientSession;

    public FastApiWebSocketHandler(WebSocketSession clientSession) {
        this.clientSession = clientSession;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("FastAPI 연결됨");
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        System.out.println("FastAPI 응답: " + message.getPayload());

        if (clientSession != null && clientSession.isOpen()) {
            clientSession.sendMessage(new TextMessage(message.getPayload()));
        }
    }
}
