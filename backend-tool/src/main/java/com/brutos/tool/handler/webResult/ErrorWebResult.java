package com.brutos.tool.handler.webResult;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

public class ErrorWebResult {
    final private int status;
    final private String error;
    final private String path;
    final private String timestamp;

    public ErrorWebResult(HttpStatus status, String error, String path) {
        this.status = status.value();
        this.error = error;
        this.path = path;
        this.timestamp = LocalDateTime.now().toString();
    }

    public int getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public String getPath() {
        return path;
    }

    public String getTimestamp() {
        return timestamp;
    }

}
