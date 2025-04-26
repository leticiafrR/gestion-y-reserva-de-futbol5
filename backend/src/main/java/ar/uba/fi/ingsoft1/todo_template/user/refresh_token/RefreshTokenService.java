package ar.uba.fi.ingsoft1.todo_template.user.refresh_token;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
public class RefreshTokenService {

    private final Long expiration;
    private final Integer byteSize;
    private final RefreshTokenRepository refreshTokenRepository;

    @Autowired
    RefreshTokenService(
            @Value("${jwt.refresh.expiration}") Long expiration,
            @Value("${jwt.refresh.bytes}") Integer byteSize,
            RefreshTokenRepository refreshTokenRepository
    ) {
        this.expiration = expiration;
        this.byteSize = byteSize;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public RefreshToken createFor(User user) {
        String value = getRandomString();
        RefreshToken result = new RefreshToken(value, user, getExpirationFor(Instant.now()));
        refreshTokenRepository.save(result);
        return result;
    }

    public Optional<RefreshToken> findByValue(String value) {
        Optional<RefreshToken> result = refreshTokenRepository.findById(value);
        result.ifPresent(refreshTokenRepository::delete);
        return result.filter(RefreshToken::isValid);
    }

    String getRandomString() {
        SecureRandom random = new SecureRandom();
        byte[] randomBytes = new byte[this.byteSize];
        random.nextBytes(randomBytes);
        return new BigInteger(1, randomBytes).toString(32);
    }

    Instant getExpirationFor(Instant reference) {
        return reference.plus(expiration, ChronoUnit.MILLIS);
    }
}
