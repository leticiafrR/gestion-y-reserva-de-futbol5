package ar.uba.fi.ingsoft1.todo_template.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Year;
import java.util.Collection;
import java.util.List;

@Entity(name = "users")
@Getter
public class User implements UserDetails, UserCredentials {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;

    @Column(unique = true, nullable = false)
    @Email
    private String username;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private Integer birthYear;

    @Column(nullable = false)
    private String zone;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String last_name;

    @Column(name = "is_email_verified", nullable = false, columnDefinition = "boolean default false")
    private Boolean emailVerified = false;

    @Column(nullable = false)
    private Boolean active = true;

    public User() {
    }

    public User(String username, String password, String role, String gender, String age,
            String zone, String name, String last_name) {
        this.username = username;
        this.password = password;
        this.birthYear = BirthYearFromStringAge(age);
        this.gender = gender;
        this.zone = zone;
        this.role = role;
        this.name = name;
        this.last_name = last_name;
    }

    private Integer BirthYearFromStringAge(String age) {
        int ageValue = Integer.parseInt(age);
        int currentYear = Year.now().getValue();
        return currentYear - ageValue;
    }

    @Override
    public String username() {
        return this.username;
    }

    @Override
    public String password() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.username;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    public String getRole() {
        return role;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public boolean isActive() {
        return active;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }
}
