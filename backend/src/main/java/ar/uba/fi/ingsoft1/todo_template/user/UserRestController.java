package ar.uba.fi.ingsoft1.todo_template.user;

import ar.uba.fi.ingsoft1.todo_template.config.GlobalControllerExceptionHandler.ErrorResponse;
import ar.uba.fi.ingsoft1.todo_template.config.GlobalControllerExceptionHandler.IncorrectValueResponse;
import ar.uba.fi.ingsoft1.todo_template.user.dto.TokenDTO;
import ar.uba.fi.ingsoft1.todo_template.user.dto.UserCreateDTO;
import ar.uba.fi.ingsoft1.todo_template.user.dto.UserLoginDTO;
import ar.uba.fi.ingsoft1.todo_template.user.dto.UserProfileDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@Tag(name = "1 - Usuarios", description = "User management endpoints")
public class UserRestController {
        private UserService userService;
        private final UserMapper userMapper;

        public UserRestController(UserService userService, UserMapper userMapper) {
                this.userService = userService;
                this.userMapper = userMapper;
        }

        @GetMapping("/verify")
        @Operation(summary = "Verify user account", description = "Verifies the user account associated with the provided token. The token is sent via email after registration.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Account verified successfully", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class))),
                        @ApiResponse(responseCode = "400", description = "Token is invalid or expired", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class))),
        })
        public ResponseEntity<String> verifyUser(@RequestParam("token") String token) {
                userService.verifyUserByEmail(token);
                return ResponseEntity.ok("Successfully verified account!");
        }

        @PostMapping("/register")
        @Operation(summary = "Register user", description = "Create a new user account")
        @ApiResponse(responseCode = "201", description = "User created successfully", content = @Content(schema = @Schema(implementation = TokenDTO.class), mediaType = "application/json"))
        @ApiResponse(responseCode = "409", description = "Some field has a useless information ", content = @Content(schema = @Schema(implementation = IncorrectValueResponse.class), mediaType = "application/json"))
        @ApiResponse(responseCode = "400", description = "Validation errors. The body is a JSON with dynamic keys corresponding to the form fields, for example: { \"username\": \"The username cannot be empty to register a user.\" }", content = @Content(mediaType = "application/json"))
        public ResponseEntity<TokenDTO> register(
                        @Parameter(description = "User registration data") @Valid @RequestBody UserCreateDTO userData) {
                return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(userData));

        }

        @PostMapping("/login")
        @Operation(summary = "Login user", description = "Login a user with their credentials to obtain a JWT token")
        @ApiResponse(responseCode = "200", description = "Successful logging", content = @Content(schema = @Schema(implementation = TokenDTO.class), mediaType = "application/json"))
        @ApiResponse(responseCode = "403", description = "Unverified email, inactive account, or invalid credentials", content = @Content(schema = @Schema(implementation = String.class), mediaType = "text/plain"))
        public ResponseEntity<TokenDTO> login(@RequestBody UserLoginDTO credentials) {
                return ResponseEntity.status(HttpStatus.OK).body(userService.loginUser(credentials));
        }

        @GetMapping("/me")
        @Operation(summary = "Load user profile", description = "Fetches the profile information of the currently authenticated user.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "User profile successfully loaded", content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserProfileDTO.class))),
                        @ApiResponse(responseCode = "401", description = "User is not authenticated or session has expired", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ResponseEntity<UserProfileDTO> getCurrentUserProfile() {
                User user = (User) userService.getAuthenticatedUser();
                return ResponseEntity.ok(userMapper.toUserProfileDTO(user));
        }

}
