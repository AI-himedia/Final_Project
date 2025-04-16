package com.aix.againhello.call.webSocketHandler;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;

import java.net.URI;
import java.nio.ByteBuffer;


public class FastApiWebSocketClient extends WebSocketClient {

    public FastApiWebSocketClient(URI serverUri) {
        super(serverUri);
    }

    @Override
    public void onOpen(ServerHandshake handshakeData) {
        System.out.println("[FastAPI 연결됨]");
    }

    @Override
    public void onMessage(String message) {
        System.out.println("[FastAPI 응답 메시지]: " + message);
    }

    @Override
    public void onMessage(ByteBuffer bytes) {
        System.out.println("[FastAPI 응답 (바이너리)]: " + bytes.remaining() + " bytes");
    }

    @Override
    public void onClose(int code, String reason, boolean remote) {
        System.out.println("[FastAPI 연결 종료됨] code=" + code + ", reason=" + reason);
    }

    @Override
    public void onError(Exception ex) {
        System.out.println("[FastAPI 연결 오류]: " + ex.getMessage());
        ex.printStackTrace();
    }

}
