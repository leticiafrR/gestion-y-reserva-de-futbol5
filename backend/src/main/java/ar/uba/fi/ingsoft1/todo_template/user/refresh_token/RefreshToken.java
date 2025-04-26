package ar.uba.fi.ingsoft1.todo_template.user.refresh_token;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.time.Instant;

@Entity
public class RefreshToken {
    @Id
    private String value;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private Instant expiresAt;

    public RefreshToken() {}

    public RefreshToken(String value, User user, Instant expiresAt) {
        this.value = value;
        this.user = user;
        this.expiresAt = expiresAt;
    }

    public String value() {
        return this.value;
    }

    public User user() {
        return this.user;
    }

    public boolean isValid() {
        return expiresAt.isAfter(Instant.now());
    }
}
