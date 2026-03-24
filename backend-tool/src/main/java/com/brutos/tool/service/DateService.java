package com.brutos.tool.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Service
public class DateService {

    public static final String DATE_FORMAT = "yyyyMMdd";

    public String getToday() {
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(DATE_FORMAT);
        return today.format(formatter);
    }

    /**
     * Contrôle si la date est correcte et existe
     *
     * @param date : Date au format yyyyMMdd
     * @throws DateTimeParseException si la date n'est pas une date existante
     */
    public void controlDate(String date) throws DateTimeParseException {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(DATE_FORMAT);
        LocalDate localDate = LocalDate.parse(date, formatter);
    }
}
