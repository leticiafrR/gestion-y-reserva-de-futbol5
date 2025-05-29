package ar.uba.fi.ingsoft1.todo_template.user.verification;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Optional;

@Service
@Transactional
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final EmailService emailService;
    private final long tokenExpirationHours;

    @Autowired
    public EmailVerificationService(
            EmailVerificationTokenRepository tokenRepository,
            EmailService emailService,
            @Value("${app.email-verification.expiration-hours:24}") long tokenExpirationHours
    ) {
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.tokenExpirationHours = tokenExpirationHours;
    }

    public void sendVerificationEmail(User user) throws IOException {
        String token = generateVerificationToken();
        Instant expiryDate = Instant.now().plus(tokenExpirationHours, ChronoUnit.HOURS);

        EmailVerificationToken verificationToken = new EmailVerificationToken(token, user, expiryDate);
        tokenRepository.save(verificationToken);

        emailService.sendVerificationEmail(user, token);
    }

    public boolean verifyEmail(String token) {
        Optional<EmailVerificationToken> verificationToken = tokenRepository.findByToken(token);

        if (verificationToken.isEmpty() || verificationToken.get().isExpired()) {
            return false;
        }

        EmailVerificationToken validToken = verificationToken.get();
        if (!validToken.isVerified()) {
            validToken.setVerified(true);
            validToken.getUser().setEmailVerified(true);
            tokenRepository.save(validToken);
        }

        return true;
    }

    private String generateVerificationToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}