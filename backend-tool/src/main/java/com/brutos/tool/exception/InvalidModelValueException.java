package com.brutos.tool.exception;

public class InvalidModelValueException extends RuntimeException {
    final static String MESSAGE = "La propriété {1} issue de la base est invalide. La valeur vaut {2} alors que la valeur attendue est {3}";

    public InvalidModelValueException(String propertyName, String modelValue, String expectedValues) {
        super(MESSAGE.replace("{1}", propertyName).replace("{2}", modelValue).replace("{3}", expectedValues));
    }

}
