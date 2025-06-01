package ar.uba.fi.ingsoft1.todo_template.user.verification;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.userServiceException.UnableToSendMessageException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Autowired
    private MessageSource messageSource;

    @Value("${spring.mail.username}")
    private String fromAddress;

    public void sendVerificationEmail(User user, String token, Locale locale) {
        String to = user.getUsername();
        String subject = messageSource.getMessage("mail.subject.verification", null, locale);
        String htmlContent = getHtmlContent(locale, token);
        try {
            sendMessage(to, subject, htmlContent);
        } catch (MessagingException e) {
            throw new UnableToSendMessageException(to);
        }
    }

    private void sendMessage(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        helper.setFrom(fromAddress);
        mailSender.send(message);
    }

    private String getHtmlContent(Locale locale, String token) {
        String title = messageSource.getMessage("mail.template.title", null, locale);
        String body = messageSource.getMessage("mail.template.body", null, locale);
        String url = messageSource.getMessage("mail.verification.url", null, locale) + token;

        Context context = new Context(locale);
        context.setVariable("title", title);
        context.setVariable("body", body);
        context.setVariable("url", url);
        return templateEngine.process("verification-email.html", context);
    }
}