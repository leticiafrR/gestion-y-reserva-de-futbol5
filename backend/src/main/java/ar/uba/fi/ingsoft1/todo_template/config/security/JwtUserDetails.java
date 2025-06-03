package ar.uba.fi.ingsoft1.todo_template.config.security;

public record JwtUserDetails (
        String username,
        String role
) {
    public String getUsername() {
        return username;
    }
}

