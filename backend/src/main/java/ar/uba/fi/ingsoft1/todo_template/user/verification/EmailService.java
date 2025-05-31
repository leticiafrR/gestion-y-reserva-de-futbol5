package ar.uba.fi.ingsoft1.todo_template.user.verification;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    // private static final Logger logger =
    // LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;

    @Autowired
    public EmailService(JavaMailSender mailSender,
            @Value("${spring.mail.username}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }
    // public void sendVerificationEmail(User user, String token) {
    // String verificationUrl = "http://localhost:30002/users/verify?token=" +
    // token;

    // // logger.info("Simulated email sent to: {}", user.getEmail());
    // // logger.info("Verification URL: {}", verificationUrl);
    // // logger.info("Email content: Welcome to Fútbol 5! Please verify your
    // // account.");
    // //
    // }

    public void sendVerificationEmail(User user, String token) {
        String to = user.getEmail();
        String subject = "Fútbol 5 - Email Verification";
        String verificationUrl = "http://localhost:30002/users/verify?token=" + token;
        String content = "Welcome to Fútbol 5! Please verify your account by clicking the link below:\n\n"
                + verificationUrl;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        message.setFrom(fromAddress);

        mailSender.send(message);
    }
}