package ar.uba.fi.ingsoft1.todo_template;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;

import ar.uba.fi.ingsoft1.todo_template.config.security.JwtService;
import ar.uba.fi.ingsoft1.todo_template.config.security.JwtUserDetails;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserCredentials;
import ar.uba.fi.ingsoft1.todo_template.user.UserRepository;
import ar.uba.fi.ingsoft1.todo_template.user.refresh_token.RefreshToken;
import ar.uba.fi.ingsoft1.todo_template.user.refresh_token.RefreshTokenService;

public class UserServiceTestHelper {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public UserServiceTestHelper(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    public User setupVerifiedUserLoginMocks(String username, String rawPassword, String hashedPassword) {
        User user = createUser(username, hashedPassword);
        user.setEmailVerified(true); // único setter disponible

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(rawPassword, hashedPassword)).thenReturn(true);
        when(jwtService.createToken(any(JwtUserDetails.class))).thenReturn("access-token-123");

        RefreshToken refreshToken = mock(RefreshToken.class);
        when(refreshToken.value()).thenReturn("refresh-token-456");
        when(refreshTokenService.createFor(user)).thenReturn(refreshToken);

        return user;
    }

    public User setupUnverifiedUserLoginMocks(String username, String rawPassword, String hashedPassword) {
        User user = createUser(username, hashedPassword);
        user.setEmailVerified(false);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(rawPassword, hashedPassword)).thenReturn(true);

        return user;
    }

    public User setupExistingUser(String username) {
        User user = createUser(username, "hashed");
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        return user;
    }

    public void setupMissingUser(String username) {
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());
    }

    public User setupValidCredentials(String username, String rawPassword, String hashedPassword) {
        User user = createUser(username, hashedPassword);
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(rawPassword, hashedPassword)).thenReturn(true);
        return user;
    }

    public User setupInvalidPassword(String username, String rawPassword, String hashedPassword) {
        User user = createUser(username, hashedPassword);
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(rawPassword, hashedPassword)).thenReturn(false);
        return user;
    }

    private User createUser(String username, String password) {
        return new User(
            username,
            password,
            "USER",
            "F",
            "25",
            "Zone123",
            "Leticia",
            "Figueroa",
            "https://example.com/profile.jpg" // <-- Valor válido para @URL
        );
    }
    public UserCredentials createCredentials(String username, String password) {
        return new UserCredentials() {
            public String username() {
                return username;
            }

            public String password() {
                return password;
            }
        };
    }
}