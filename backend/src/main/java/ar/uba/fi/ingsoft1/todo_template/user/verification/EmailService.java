package ar.uba.fi.ingsoft1.todo_template.user.verification;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class EmailService {

    private final SendGrid sendGrid;
    private final String baseUrl;
    private final String fromEmail;

    @Autowired
    public EmailService(
            @Value("${sendgrid.api-key}") String apiKey,
            @Value("${app.base-url}") String baseUrl,
            @Value("${sendgrid.from-email}") String fromEmail
    ) {
        this.sendGrid = new SendGrid(apiKey);
        this.baseUrl = baseUrl;
        this.fromEmail = fromEmail;
    }

    public void sendVerificationEmail(User user, String token) throws IOException {
        String verificationUrl = baseUrl + "/users/verify?token=" + token;

        Email from = new Email(fromEmail);
        Email to = new Email(user.getEmail());
        String subject = "Verifica tu cuenta de Fútbol 5";

        String htmlContent = String.format("""
            <html>
                <body>
                    <h2>¡Bienvenido a Fútbol 5!</h2>
                    <p>Hola %s,</p>
                    <p>Gracias por registrarte. Por favor, haz clic en el siguiente enlace para verificar tu cuenta:</p>
                    <p><a href="%s">Verificar mi cuenta</a></p>
                    <p>Este enlace expirará en 24 horas.</p>
                    <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
                    <p>Saludos,<br/>El equipo de Fútbol 5</p>
                </body>
            </html>
            """, user.getUsername(), verificationUrl);

        Content content = new Content("text/html", htmlContent);
        Mail mail = new Mail(from, subject, to, content);

        Request request = new Request();
        request.setMethod(Method.POST);
        request.setEndpoint("mail/send");
        request.setBody(mail.build());

        Response response = sendGrid.api(request);
        if (response.getStatusCode() >= 400) {
            throw new IOException("Error sending email: " + response.getBody());
        }
    }
}