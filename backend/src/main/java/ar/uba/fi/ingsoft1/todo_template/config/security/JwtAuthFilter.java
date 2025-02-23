package ar.uba.fi.ingsoft1.todo_template.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Autowired
    JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        this.authenticateToken(request);
        filterChain.doFilter(request, response);
    }

    private void authenticateToken(HttpServletRequest request) {
        // Is the user already authenticated?
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            return;
        }

        // Try to get the token
        String authHeader = request.getHeader("Authorization");
        String headerPrefix = "Bearer ";
        if (authHeader == null || !authHeader.startsWith(headerPrefix)) {
            return;
        }
        String token = authHeader.substring(headerPrefix.length());

        jwtService.extractVerifiedUserDetails(token).ifPresent(userDetails -> {
            var authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    List.of(new SimpleGrantedAuthority(userDetails.role()))
            );
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        });
    }
}
