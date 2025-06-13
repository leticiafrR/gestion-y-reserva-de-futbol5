package ar.uba.fi.ingsoft1.todo_template;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserCredentials;
import ar.uba.fi.ingsoft1.todo_template.user.UserRepository;
import ar.uba.fi.ingsoft1.todo_template.user.dto.UserCreateDTO;
import ar.uba.fi.ingsoft1.todo_template.user.refresh_token.RefreshTokenRepository;
import ar.uba.fi.ingsoft1.todo_template.user.verification.EmailVerificationTokenRepository;

@Component
public class DatabaseHelper {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private RefreshTokenRepository refreshTokenRepository;
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    private List<UserCredentials> defaultVerifiedUsers;
    final String defaultPassword = "123";

    public void cleanUp() {
        refreshTokenRepository.deleteAll();
        emailVerificationTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    public void seedDefaultUsers() {
        var unverifiedUserCredentials = createCredentials("unverified@example.com");
        seedUser(unverifiedUserCredentials, false);
        defaultVerifiedUsers.forEach(credentials -> {
            seedUser(credentials, true);
        });

    }

    public void seedUser(UserCredentials credentials, Boolean isVerified) {
        User user = new UserCreateDTO(
                "name",
                "last-name",
                credentials.username(),
                credentials.password(),
                "USER",
                "female",
                "2005",
                "Buenos Aires",
                "https://example.com/profile1.jpg").asUser(passwordEncoder::encode);

        user.setEmailVerified(isVerified);
        userRepository.save(user);
    }

    public UserCredentials createCredentials(String username) {
        return new UserCredentials() {
            public String username() {
                return username;
            }

            public String password() {
                return defaultPassword;
            }
        };
    }

    public DatabaseHelper(UserRepository userRepository, PasswordEncoder passwordEncoder,
            RefreshTokenRepository refreshTokenRepository,
            EmailVerificationTokenRepository emailVerificationTokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenRepository = refreshTokenRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;

        this.defaultVerifiedUsers = List.of(createCredentials("leticia@example.com"),
                createCredentials("seed.elisa@example.com"),
                createCredentials("seed.example@example.com"),
                createCredentials("seed.santiago@example.com"),
                createCredentials("seed.fede@example.com"));
    }

}
