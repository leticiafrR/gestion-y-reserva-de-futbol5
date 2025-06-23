package ar.uba.fi.ingsoft1.todo_template.common;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import ar.uba.fi.ingsoft1.todo_template.config.security.JwtUserDetails;

public class HelperAuthenticatedUser {

    static public String getAuthenticatedUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ((JwtUserDetails) auth.getPrincipal()).username();
    }

}