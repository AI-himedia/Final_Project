package com.aix.againhello.call.webSocketHandler;

import org.java_websocket.WebSocket;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.drafts.Draft_6455;
import org.java_websocket.framing.Framedata;
import org.java_websocket.framing.PingFrame;
import org.java_websocket.framing.PongFrame;
import org.java_websocket.handshake.ServerHandshake;
import java.net.URI;
import java.nio.ByteBuffer;
import java.util.Map;
import java.util.function.Consumer;


public class FastApiWebSocketClient extends WebSocketClient {

    private Consumer<String> messageRelayCallback;
    private Consumer<ByteBuffer> binaryRelayCallback;

    public FastApiWebSocketClient(URI serverUri, Map<String, String> httpHeaders) {
        super(serverUri, new Draft_6455(), httpHeaders, 0);
    }

    public void setMessageRelayCallback(Consumer<String> callback) {
        this.messageRelayCallback = callback;
    }

    public void setBinaryRelayCallback(Consumer<ByteBuffer> callback) {
        this.binaryRelayCallback = callback;
    }

    @Override
    public void onWebsocketPing(WebSocket conn, Framedata f) {
        try {
            conn.sendFrame(new PongFrame((PingFrame) f));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onOpen(ServerHandshake handshakeData) {
        System.out.println("[FastAPI 연결됨]");
    }

    @Override
    public void onMessage(String message) {
        System.out.println("[FastAPI 응답 메시지]: " + message);
        if (messageRelayCallback != null) {
            messageRelayCallback.accept(message);
        }
    }

    @Override
    public void onMessage(ByteBuffer bytes) {
        System.out.println("[FastAPI 응답 (바이너리)]: " + bytes.remaining() + " bytes");
        if (binaryRelayCallback != null) {
            binaryRelayCallback.accept(bytes);
        }
    }

    @Override
    public void onClose(int code, String reason, boolean remote) {
        System.out.println("[FastAPI 연결 종료됨] code=" + code + ", reason=" + reason);
    }

    @Override
    public void onError(Exception ex) {
        System.out.println("[FastAPI 연결 오류]: " + ex.getMessage());
    }

}
