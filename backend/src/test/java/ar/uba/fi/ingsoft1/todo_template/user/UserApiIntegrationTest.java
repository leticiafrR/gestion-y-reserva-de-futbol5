package ar.uba.fi.ingsoft1.todo_template.user;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.http.*;
import ar.uba.fi.ingsoft1.todo_template.BaseIntegrationTest;
import ar.uba.fi.ingsoft1.todo_template.user.dto.TokenDTO;
import ar.uba.fi.ingsoft1.todo_template.user.dto.UserCreateDTO;
import ar.uba.fi.ingsoft1.todo_template.user.dto.UserLoginDTO;
import ar.uba.fi.ingsoft1.todo_template.user.dto.UserProfileDTO;

public class UserApiIntegrationTest extends BaseIntegrationTest {

    @Test
    public void shouldReturnOkWithAuthenticatedUser() {
        ResponseEntity<UserProfileDTO> response = authenticatedGet("/users/me",
                UserProfileDTO.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    public void shouldRegisterUserSuccessfully() {
        UserCreateDTO newUser = new UserCreateDTO(
                "Elisa",
                "Gómez",
                "unic1@example.com",
                "password123",
                "USER",
                "female",
                "1990",
                "Lima",
                "https://example.com/photo.jpg");

        ResponseEntity<TokenDTO> response = restTemplate.postForEntity(
                buildUrl("/users/register"),
                newUser,
                TokenDTO.class);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().accessToken());
    }

    @Test
    public void shouldNotRegisterUserWithInvalidEmail() {
        UserCreateDTO invalidUser = new UserCreateDTO(
                "Bad",
                "Email",
                "not-an-email",
                "password123",
                "USER",
                "female",
                "1990",
                "City",
                "https://example.com/photo.jpg");

        ResponseEntity<String> response = restTemplate.postForEntity(
                buildUrl("/users/register"),
                invalidUser,
                String.class);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().contains("username"));
    }

    @Test
    public void shouldLoginSuccessfully() {
        UserLoginDTO credentials = new UserLoginDTO("test@user.com", "123");

        ResponseEntity<TokenDTO> response = restTemplate.postForEntity(
                buildUrl("/users/login"),
                credentials,
                TokenDTO.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().accessToken());
    }

    @Test
    public void shouldFailLoginWithInvalidPassword() {
        UserLoginDTO credentials = new UserLoginDTO("test@user.com", "wrongpass");

        ResponseEntity<String> response = restTemplate.postForEntity(
                buildUrl("/users/login"),
                credentials,
                String.class);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    public void shouldFailLoginWithNonExistentUser() {
        UserLoginDTO invalidCredentials = new UserLoginDTO("inexistente@correo.com", "noexiste");

        ResponseEntity<String> response = restTemplate.postForEntity(
                buildUrl("/users/login"),
                invalidCredentials,
                String.class);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertTrue(response.getBody().contains("Invalid credentials") || response.getBody().contains("403"));
    }

    @Test
    public void shouldFailVerifyWithInvalidToken() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                buildUrl("/users/verify?token=invalid-token"),
                String.class);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }
}