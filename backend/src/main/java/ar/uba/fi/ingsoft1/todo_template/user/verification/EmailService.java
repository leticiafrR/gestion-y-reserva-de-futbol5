package ar.uba.fi.ingsoft1.todo_template.user.verification;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public void sendVerificationEmail(User user, String token) {
        String verificationUrl = "http://localhost:30002/users/verify?token=" + token;

        logger.info("Simulated email sent to: {}", user.getEmail());
        logger.info("Verification URL: {}", verificationUrl);
        logger.info("Email content: Welcome to Fútbol 5! Please verify your account.");
    }
}