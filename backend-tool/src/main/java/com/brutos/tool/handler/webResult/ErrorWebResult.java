package com.brutos.tool.handler.webResult;

import org.springframework.http.HttpStatus;

public class ErrorWebResult {
    HttpStatus status;
    String error;

    public ErrorWebResult(HttpStatus status, String error) {
        this.status = status;
        this.error = error;
    }
}
