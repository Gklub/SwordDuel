/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package com.knowledgecode.cordova.websocket;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.LOG;
import org.apache.cordova.PluginResult;
import org.apache.cordova.PluginResult.Status;
import org.eclipse.jetty.websocket.WebSocket.Connection;
import org.eclipse.jetty.websocket.WebSocketClient;
import org.eclipse.jetty.websocket.WebSocketClientFactory;
import org.json.JSONArray;
import org.json.JSONObject;

import android.util.Base64;

/**
 * Cordova WebSocket Plugin for Android
 * This plugin is using Jetty under the terms of the Apache License v2.0.
 * @author KNOWLEDGECODE <knowledgecode@gmail.com>
 * @version 0.4.0
 */
public class WebSocket extends CordovaPlugin {

    private WebSocketClientFactory _factory;
    private Map<Integer, Connection> _conn;

    private abstract static class JettyWebSocket implements
        org.eclipse.jetty.websocket.WebSocket.OnTextMessage,
        org.eclipse.jetty.websocket.WebSocket.OnBinaryMessage,
        org.eclipse.jetty.websocket.WebSocket.OnFrame {
        private static final int BUFFER_SIZE = 8192;

        private FrameConnection _frame;
        private boolean _binary;
        private ByteArrayOutputStream _stream;

        public JettyWebSocket() {
            _stream = new ByteArrayOutputStream(BUFFER_SIZE);
        }

        public abstract int getMaxBinaryMessageSize();

        @Override
        public boolean onFrame(byte flags, byte opcode, byte[] data, int offset, int length) {
            if (_frame.isBinary(opcode) || (_frame.isContinuation(opcode) && _binary)) {
                _binary = true;
                if (binaryMessageTooLarge(_stream.size(), length - offset)) {
                    _stream.write(data, offset, length);
                }
                if (_frame.isMessageComplete(flags)) {
                    _binary = false;
                    this.onMessage(_stream.toByteArray(), 0, _stream.size());
                    _stream.reset();
                }
                return true;
            } else if (_frame.isClose(opcode)) {
                release();
            }
            return false;
        }

        @Override
        public void onHandshake(FrameConnection connection) {
            _frame = connection;
        }

        /**
         * Check binary message size.
         * @param currentSize
         * @param length
         * @return check result
         */
        private boolean binaryMessageTooLarge(int currentSize, int length) {
            if (currentSize + length > getMaxBinaryMessageSize()) {
                LOG.w("CordovaLog", "Binary message too large > " + getMaxBinaryMessageSize() + "B");
                _frame.close(1009, "Message size > " + getMaxBinaryMessageSize());
                return false;
            }
            return true;
        }

        /**
         * Release resources.
         */
        private void release() {
            if (_stream != null) {
                try {
                    _stream.close();
                } catch (IOException e) {
                }
                _stream = null;
            }
            if (_frame.isOpen()) {
                _frame.close();
            }
            _frame = null;
        }
    }

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        _factory = new WebSocketClientFactory();
        _conn = new ConcurrentHashMap<Integer, Connection>();
        try {
            start();
        } catch (Exception e) {
        }
    }

    @Override
    public boolean execute(String action, String rawArgs, CallbackContext ctx) {
        if ("create".equals(action)) {
            WebSocketClient client = _factory.newWebSocketClient();
            cordova.getThreadPool().execute(new Creation(client, _conn, ctx, rawArgs));
        } else if ("send".equals(action)) {
            cordova.getThreadPool().execute(new Send(_conn, ctx, rawArgs));
        } else if ("close".equals(action)) {
            cordova.getThreadPool().execute(new Close(_conn, ctx, rawArgs));
        } else {
            return false;
        }
        return true;
    };

    @Override
    public void onReset() {
        try {
            if (_factory != null) {
                stop().start();
            }
        } catch (Exception e) {
        }
    }

    @Override
    public void onDestroy() {
        try {
            stop();
        } catch (Exception e) {
        }
        _conn = null;
        _factory.destroy();
        _factory = null;
    }

    /**
     * Connect to server.
     */
    private static class Creation implements Runnable {
        private WebSocketClient client;
        private Map<Integer, Connection> map;
        private CallbackContext ctx;
        private String rawArgs;

        public Creation(WebSocketClient client, Map<Integer, Connection> map, CallbackContext ctx, String rawArgs) {
            this.client = client;
            this.map = map;
            this.ctx = ctx;
            this.rawArgs = rawArgs;
        }

        @Override
        public void run() {
            try {
                JSONArray args = new JSONArray(rawArgs);
                final int id = args.getInt(0);
                String url = args.getString(1);
                String protocol = args.getString(2);
                JSONObject options = args.getJSONObject(3);
                String origin = options.optString("origin", "");
                long maxConnectTime =  options.optLong("maxConnectTime", 20000);
                int maxTextMessageSize = options.optInt("maxTextMessageSize", 32 * 1024);
                final int maxBinaryMessageSize = options.optInt("maxBinaryMessageSize", 32 * 1024);

                if (protocol.length() > 0) {
                    client.setProtocol(protocol);
                }
                if (origin.length() > 0) {
                    client.setOrigin(origin);
                }
                client.setMaxTextMessageSize(maxTextMessageSize);
                client.setMaxBinaryMessageSize(-1);

                client.open(complementPort(url), new JettyWebSocket() {
                    @Override
                    public void onOpen(Connection conn) {
                        map.put(id, conn);
                        String callbackString = createCallback("onopen");
                        sendCallback(callbackString, true);
                    }

                    @Override
                    public void onMessage(String data) {
                        String callbackString = createCallback("onmessage", data);
                        sendCallback(callbackString, true);
                    }

                    @Override
                    public void onMessage(byte[] data, int offset, int length) {
                        String callbackString = createCallback("onmessage", data);
                        sendCallback(callbackString, true);
                    }

                    @Override
                    public void onClose(int code, String reason) {
                        if (map.containsKey(id)) {
                            map.remove(id);
                        }
                        String callbackString = createCallback("onclose", code, reason);
                        sendCallback(callbackString, false);
                    }

                    @Override
                    public int getMaxBinaryMessageSize() {
                        return maxBinaryMessageSize;
                    }

                    /**
                     * Send plugin result.
                     * @param callbackString
                     * @param keepCallback
                     */
                    private void sendCallback(String callbackString, boolean keepCallback) {
                        if (!ctx.isFinished()) {
                            PluginResult result = new PluginResult(Status.OK, callbackString);
                            result.setKeepCallback(keepCallback);
                            ctx.sendPluginResult(result);
                        }
                    }

                    /**
                     * Create Callback JSON String.
                     * @param event
                     * @return JSON String
                     */
                    private String createCallback(String event) {
                        String json = "{\"event\":\"%s\"}";
                        return String.format(json, event);
                    }

                    /**
                     * Create Callback JSON String.
                     * @param event
                     * @param data
                     * @return JSON String
                     */
                    private String createCallback(String event, String data) {
                        String json = "{\"event\":\"%s\",\"data\":\"%s\"}";
                        return String.format(json, event, data.replaceAll("\"", "\\\\\""));
                    }

                    /**
                     * Create Callback JSON String.
                     * @param event
                     * @param input
                     * @return JSON String
                     */
                    private String createCallback(String event, byte[] input) {
                        String json = "{\"event\":\"%s\",\"data\":\"%s\",\"binary\":true}";
                        String data = Base64.encodeToString(input, Base64.NO_WRAP);
                        return String.format(json, event, data);
                    }

                    /**
                     * Create Callback JSON String.
                     * @param event
                     * @param code
                     * @param reason
                     * @return JSON String
                     */
                    private String createCallback(String event, int code, String reason) {
                        String json = "{\"event\":\"%s\",\"wasClean\":%b,\"code\":%d,\"reason\":\"%s\"}";
                        boolean wasClean = code == 1000;
                        reason = reason == null ? "" : reason;
                        return String.format(json, event, wasClean, code, reason.replaceAll("\"", "\\\\\""));
                    }
                }, maxConnectTime, TimeUnit.MILLISECONDS);
            } catch (Exception e) {
                if (!ctx.isFinished()) {
                    PluginResult result = new PluginResult(Status.ERROR);
                    result.setKeepCallback(true);
                    ctx.sendPluginResult(result);
                }
            }
        }

        /**
         * Complement default port number.
         * @param url
         * @return URI
         * @throws URISyntaxException
         */
        private URI complementPort(String url) throws URISyntaxException {
            URI uri = new URI(url);
            int port = uri.getPort();

            if (port < 0) {
                if ("ws".equals(uri.getScheme())) {
                    port = 80;
                } else if ("wss".equals(uri.getScheme())) {
                    port = 443;
                }
                uri = new URI(uri.getScheme(), "", uri.getHost(), port, uri.getPath(), uri.getQuery(), "");
            }
            return uri;
        }
    }

    /**
     * Send text/binary data.
     */
    private static class Send implements Runnable {
        private Map<Integer, Connection> map;
        private CallbackContext ctx;
        private String rawArgs;

        public Send(Map<Integer, Connection> map, CallbackContext ctx, String rawArgs) {
            this.map = map;
            this.ctx = ctx;
            this.rawArgs = rawArgs;
        }

        @Override
        public void run() {
            try {
                JSONArray args = new JSONArray(rawArgs);
                Connection conn = map.get(args.getInt(0));
                String data = args.getString(1);
                boolean binaryString = args.getBoolean(2);

                if (conn != null) {
                    if (binaryString) {
                        byte[] binary = Base64.decode(data, Base64.NO_WRAP);
                        conn.sendMessage(binary, 0, binary.length);
                    } else {
                        conn.sendMessage(data);
                    }
                }
            } catch (Exception e) {
                ctx.error("send");
            }
        }
    }

    /**
     * Close a connection.
     */
    private static class Close implements Runnable {
        private Map<Integer, Connection> map;
        private CallbackContext ctx;
        private String rawArgs;

        public Close(Map<Integer, Connection> map, CallbackContext ctx, String rawArgs) {
            this.map = map;
            this.ctx = ctx;
            this.rawArgs = rawArgs;
        }

        @Override
        public void run() {
            try {
                JSONArray args = new JSONArray(rawArgs);
                Connection conn = map.get(args.getInt(0));
                int code = args.getInt(1);
                String reason = args.getString(2);

                if (conn != null) {
                    if (code > 0) {
                        conn.close(code, reason);
                    } else {
                        conn.close();
                    }
                }
            } catch (Exception e) {
                ctx.error("close");
            }
        }
    }

    /**
     * Start WebSocketClientFactory.
     * @return WebSocket
     * @throws Exception
     */
    private WebSocket start() throws Exception {
        _factory.start();
        return this;
    }

    /**
     * Stop WebSocketClientFactory.
     * @return WebSocket
     * @throws Exception
     */
    private WebSocket stop() throws Exception {
        if (_conn != null) {
            for (Integer key : _conn.keySet()) {
                if (_conn.get(key).isOpen()) {
                    _conn.get(key).close();
                }
            }
            _conn.clear();
        }
        _factory.stop();
        return this;
    }
}
