package ar.uba.fi.ingsoft1.todo_template.user.verification;

import ar.uba.fi.ingsoft1.todo_template.email.EmailService;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.userServiceException.InvalidTokenException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Locale;
import java.util.Optional;

@Service
@Transactional
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final EmailService emailService;
    private final long tokenExpirationHours;
    private final VerificationFormatService verificationFormatService;

    @Autowired
    public EmailVerificationService(
            EmailVerificationTokenRepository tokenRepository,
            EmailService emailService,
            VerificationFormatService verificationFormatService,
            @Value("${app.email-verification.expiration-hours:24}") long tokenExpirationHours) {
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.tokenExpirationHours = tokenExpirationHours;
        this.verificationFormatService=verificationFormatService;
    }

    public void sendVerificationEmail(User user) {
        String token = generateVerificationToken();
        Instant expiryDate = Instant.now().plus(tokenExpirationHours, ChronoUnit.HOURS);

        EmailVerificationToken verificationToken = new EmailVerificationToken(token, user, expiryDate);
        tokenRepository.save(verificationToken);
        var contNormalized =verificationFormatService.getContEmailNormalized(user.getUsername(), token, Locale.ENGLISH);
        emailService.sendMailMessage(contNormalized);
    }

    public Optional<User> verifyUserByEmail(String token) {
        EmailVerificationToken validToken = getEmailVerificationToken(token);
        if (validToken.isVerified()) {
            return Optional.empty();
        }
        validToken.setVerified(true);
        tokenRepository.save(validToken);
        return Optional.of(validToken.getUser());

    }

    private EmailVerificationToken getEmailVerificationToken(String token) {
        return tokenRepository.findByToken(token)
                .orElseThrow(InvalidTokenException::new);
    }

    private String generateVerificationToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
