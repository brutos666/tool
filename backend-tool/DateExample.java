import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class DateExample {
    public static void main(String[] args) {
        // Récupérer la date du jour
        LocalDate today = LocalDate.now();
        
        // Formater en AAAMMJJ
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        String formattedDate = today.format(formatter);
        
        System.out.println("Date du jour (AAAMMJJ): " + formattedDate);
    }
}
