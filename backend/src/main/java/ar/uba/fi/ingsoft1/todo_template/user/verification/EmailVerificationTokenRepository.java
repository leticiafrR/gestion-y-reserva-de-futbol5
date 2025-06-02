package ar.uba.fi.ingsoft1.todo_template.user.verification;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    Optional<EmailVerificationToken> findByToken(String token);
}
