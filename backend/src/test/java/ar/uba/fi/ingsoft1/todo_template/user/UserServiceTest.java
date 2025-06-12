package ar.uba.fi.ingsoft1.todo_template.user;

import static org.junit.jupiter.api.Assertions.*;

import ar.uba.fi.ingsoft1.todo_template.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import ar.uba.fi.ingsoft1.todo_template.config.security.JwtService;
import ar.uba.fi.ingsoft1.todo_template.user.dto.TokenDTO;
import ar.uba.fi.ingsoft1.todo_template.user.refresh_token.RefreshTokenService;
import ar.uba.fi.ingsoft1.todo_template.user.userServiceException.InactiveOrUnverifiedAccountException;
import ar.uba.fi.ingsoft1.todo_template.user.userServiceException.InavlidCredentialsException;
import ar.uba.fi.ingsoft1.todo_template.user.verification.EmailVerificationService;

public class UserServiceTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private EmailVerificationService emailVerificationService;

    @InjectMocks
    private UserService userService;

    private UserServiceTestHelper testHelper;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testHelper = new UserServiceTestHelper(userRepository, passwordEncoder, jwtService, refreshTokenService);
    }

    @Test
    void loadUserByUsername_returnsUser_whenExists() {
        testHelper.setupExistingUser("testuser");

        UserDetails result = userService.loadUserByUsername("testuser");

        assertEquals("testuser", result.getUsername());
    }

    @Test
    void loadUserByUsername_throwsException_whenNotFound() {
        testHelper.setupMissingUser("missinguser");
        assertThrows(UsernameNotFoundException.class, () -> {
            userService.loadUserByUsername("missinguser");
        });
    }

    @Test
    void matchCredentials_returnsUser_whenCredentialsValid() {
        testHelper.setupValidCredentials("validuser", "password", "hashed");
        User result = userService.matchCredentials(testHelper.createCredentials("validuser", "password"));
        assertEquals("validuser", result.getUsername());
    }

    @Test
    void matchCredentials_throwsException_whenInvalidPassword() {
        testHelper.setupInvalidPassword("user", "wrong", "hashed");
        assertThrows(InavlidCredentialsException.class, () -> {
            userService.matchCredentials(testHelper.createCredentials("user", "wrong"));
        });
    }

    @Test
    void loginUser_throwsException_whenUnverified() {
        testHelper.setupUnverifiedUserLoginMocks("notVerifiedEmail", "pass", "hashed");
        assertThrows(InactiveOrUnverifiedAccountException.class, () -> {
            userService.loginUser(testHelper.createCredentials("notVerifiedEmail", "pass"));
        });
    }

    @Test
    void loginUser_succeeds_whenVerified() {
        testHelper.setupVerifiedUserLoginMocks("verifiedEmail", "pass", "hashed");
        TokenDTO tokens = userService.loginUser(testHelper.createCredentials("verifiedEmail", "pass"));
        assertNotNull(tokens);
        assertEquals("access-token-123", tokens.accessToken());
        assertEquals("refresh-token-456", tokens.refreshToken());
    }

}
