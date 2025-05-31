package ar.uba.fi.ingsoft1.todo_template.user;

import ar.uba.fi.ingsoft1.todo_template.config.security.JwtService;
import ar.uba.fi.ingsoft1.todo_template.config.security.JwtUserDetails;
import ar.uba.fi.ingsoft1.todo_template.user.refresh_token.RefreshToken;
import ar.uba.fi.ingsoft1.todo_template.user.refresh_token.RefreshTokenService;
import ar.uba.fi.ingsoft1.todo_template.user.userServiceException.DuplicateEmailException;
import ar.uba.fi.ingsoft1.todo_template.user.userServiceException.DuplicateUsernameException;
import ar.uba.fi.ingsoft1.todo_template.user.verification.EmailVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class UserService implements UserDetailsService {

    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final EmailVerificationService emailVerificationService;

    @Autowired
    UserService(
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            RefreshTokenService refreshTokenService,
            EmailVerificationService emailVerificationService) {
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.refreshTokenService = refreshTokenService;
        this.emailVerificationService = emailVerificationService;
    }

    public void verifyUserByEmail(String token) {
        Optional<User> maybeUser = emailVerificationService.verifyUserByEmail(token);
        if (!maybeUser.isEmpty()) {
            maybeUser.get().setEmailVerified(true);
            userRepository.save(maybeUser.get());
        }
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository
                .findByUsername(username)
                .orElseThrow(() -> {
                    var msg = String.format("Username '%s' not found", username);
                    return new UsernameNotFoundException(msg);
                });
    }

    TokenDTO createUser(UserCreateDTO data) {
        checkUnicValuesToCreateUser(data);
        var user = data.asUser(passwordEncoder::encode);
        userRepository.save(user);
        emailVerificationService.sendVerificationEmail(user);
        return generateTokens(user);
    }

    Optional<TokenDTO> loginUser(UserCredentials data) {
        Optional<User> maybeUser = userRepository.findByUsername(data.username());
        return maybeUser
                .filter(user -> passwordEncoder.matches(data.password(), user.getPassword()))
                .filter(User::isEmailVerified)
                .filter(User::isActive)
                .map(this::generateTokens);
    }

    Optional<TokenDTO> refresh(RefreshDTO data) {
        return refreshTokenService.findByValue(data.refreshToken())
                .map(RefreshToken::user)
                .map(this::generateTokens);
    }

    private TokenDTO generateTokens(User user) {
        String accessToken = jwtService.createToken(new JwtUserDetails(
                user.getUsername(),
                user.getRole()));

        RefreshToken refreshToken = refreshTokenService.createFor(user);
        return new TokenDTO(accessToken, refreshToken.value());
    }

    private void checkUnicValuesToCreateUser(UserCreateDTO data) {
        if (userRepository.existsByUsername(data.username())) {
            throw new DuplicateUsernameException(data.username());
        }

        if (userRepository.existsByEmail(data.email())) {
            throw new DuplicateEmailException(data.email());
        }
    }
}
