package com.brutos.tool.handler;

import com.brutos.tool.handler.webResult.ErrorWebResult;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.message.ParameterizedMessage;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.Map;

@RestControllerAdvice
public class ExceptionHandlingController {
    public static final String REQUEST = "Requête en erreur : `{}`";
    Logger logger = LogManager.getLogger(ExceptionHandlingController.class);

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorWebResult handleError(HttpServletRequest req, Exception ex) {
        logger.error(new ParameterizedMessage(REQUEST, req.getRequestURI()), ex);
        String errorMessage = "Erreur interne :" + ex.getMessage();
        if (ex.getCause() != null) {
            errorMessage += "\n Cause :" + ex.getCause().getMessage();
        }
        return new ErrorWebResult(HttpStatus.INTERNAL_SERVER_ERROR, errorMessage, req.getRequestURI());
    }

    @ExceptionHandler(DateTimeParseException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorWebResult handleDateTimeParseException(HttpServletRequest req, DateTimeParseException ex) {
        logger.error(new ParameterizedMessage(REQUEST, req.getRequestURI()), ex);
        return new ErrorWebResult(HttpStatus.INTERNAL_SERVER_ERROR, "Date invalide", req.getRequestURI());
    }

    @ExceptionHandler(BadSqlGrammarException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Map<String, Object> handleBadSqlGrammarException(HttpServletRequest req, BadSqlGrammarException ex) {
        logger.error(new ParameterizedMessage(REQUEST, req.getRequestURI()), ex);
        return Map.of("timestamp", LocalDateTime.now(),
                "status", HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "error", "Mauvaise requête :" + ex.getSql() + "\n Cause :" + ex.getCause().getMessage(),
                "path", req.getRequestURI());
    }
}