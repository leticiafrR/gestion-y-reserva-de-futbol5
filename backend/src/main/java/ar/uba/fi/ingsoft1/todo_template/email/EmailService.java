package ar.uba.fi.ingsoft1.todo_template.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    public void sendMailMessage(List<String> normalizedCont) throws UnableToSendMessageException{
        try {
            sendMessage(normalizedCont.get(0), normalizedCont.get(1), normalizedCont.get(2));
        } catch (MessagingException e) {
            throw new UnableToSendMessageException(normalizedCont.getFirst());
        }
    }

    public void sendMessage(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        helper.setFrom(fromAddress);
        mailSender.send(message);
    }

    @Autowired
    private TemplateEngine emailTemplateEngine;

    public void sendTeamConfirmation(String to, String nombre, String fecha, String hora, String equipo) {
        Context context = new Context();
        context.setVariable("nombre", nombre);
        context.setVariable("fecha", fecha);
        context.setVariable("hora", hora);
        context.setVariable("equipo", equipo);

        String htmlContent = emailTemplateEngine.process("confirmed-team", context);

        try {
            sendMessage(to, "Confirmación de equipo para el partido", htmlContent);
        } catch (MessagingException e) {
            throw new UnableToSendMessageException(to);
        }
    }
}