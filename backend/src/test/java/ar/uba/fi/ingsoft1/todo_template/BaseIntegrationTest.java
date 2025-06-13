package ar.uba.fi.ingsoft1.todo_template;

import static org.junit.jupiter.api.Assertions.assertFalse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;

import org.springframework.transaction.annotation.Transactional;

import ar.uba.fi.ingsoft1.todo_template.user.UserRepository;
import ar.uba.fi.ingsoft1.todo_template.user.UserService;
import org.springframework.http.*;

@SpringBootTest(properties = "spring.sql.init.mode=never", webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestInstance(TestInstance.Lifecycle.PER_METHOD)
public class BaseIntegrationTest {
    @Autowired
    protected UserService userService;
    @Autowired
    protected DatabaseHelper dataBaseController;

    private String accessToken;
    private final String currentUsername = "test@user.com";

    @Autowired
    protected UserRepository userRepository;

    @LocalServerPort
    private int port;

    @Autowired
    protected TestRestTemplate restTemplate;

    @BeforeEach
    @Transactional
    void setUp() {
        dataBaseController.cleanUp();
        dataBaseController.seedDefaultUsers();
        var currentUser = dataBaseController.createCredentials(currentUsername);
        dataBaseController.seedUser(currentUser, true);
        this.accessToken = userService.loginUser(currentUser).accessToken();
    }

    protected String buildUrl(String path) {
        return "http://localhost:" + this.port + path;
    }

    private HttpHeaders buildAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    public <T> ResponseEntity<T> authenticatedGet(String path, Class<T> responseType) {
        HttpEntity<Void> entity = new HttpEntity<>(buildAuthHeaders());
        return restTemplate.exchange(buildUrl(path), HttpMethod.GET, entity, responseType);
    }

    public <T, R> ResponseEntity<R> authenticatedPost(String path, T body, Class<R> responseType) {
        HttpEntity<T> entity = new HttpEntity<>(body, buildAuthHeaders());
        return restTemplate.exchange(buildUrl(path), HttpMethod.POST, entity, responseType);
    }

    public <T, R> ResponseEntity<R> authenticatedPut(String path, T body, Class<R> responseType) {
        HttpEntity<T> entity = new HttpEntity<>(body, buildAuthHeaders());
        return restTemplate.exchange(buildUrl(path), HttpMethod.PUT, entity, responseType);
    }

    public <T, R> ResponseEntity<R> authenticatedPatch(String path, T body, Class<R> responseType) {
        HttpEntity<T> entity = new HttpEntity<>(body, buildAuthHeaders());
        return restTemplate.exchange(buildUrl(path), HttpMethod.PATCH, entity, responseType);
    }

    public <R> ResponseEntity<R> authenticatedDelete(String path, Class<R> responseType) {
        HttpEntity<Void> entity = new HttpEntity<>(buildAuthHeaders());
        return restTemplate.exchange(buildUrl(path), HttpMethod.DELETE, entity, responseType);
    }

    @Test
    void testUsuariosDeEjemploCargados() {
        var usuarios = userRepository.findAll();
        assertFalse(usuarios.isEmpty(), "La base no fue poblada");
    }
}
