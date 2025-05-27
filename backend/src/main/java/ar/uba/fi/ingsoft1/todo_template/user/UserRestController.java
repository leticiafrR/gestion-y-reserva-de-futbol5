package ar.uba.fi.ingsoft1.todo_template.user;

import ar.uba.fi.ingsoft1.todo_template.config.security.JwtService;
import ar.uba.fi.ingsoft1.todo_template.config.security.JwtUserDetails;
import ar.uba.fi.ingsoft1.todo_template.dto.PaginatedResponse;
import ar.uba.fi.ingsoft1.todo_template.dto.UserProfileDTO;
import ar.uba.fi.ingsoft1.todo_template.dto.UserSearchResultDTO;
import ar.uba.fi.ingsoft1.todo_template.user.TokenDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/users")
@Tag(name = "1 - Usuarios", description = "Endpoints de gestión de usuarios")
public class UserRestController {
        private final JwtService jwtService;

        public UserRestController(JwtService jwtService) {
                this.jwtService = jwtService;
        }

        @PostMapping("/register")
        @Operation(summary = "Registrar usuario", description = "Crea una nueva cuenta de usuario")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Usuario creado exitosamente"),
                        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos")
        })
        public ResponseEntity<TokenDTO> register(
                        @Parameter(description = "Datos de registro del usuario") @Valid @RequestBody UserProfileDTO userData) {

                JwtUserDetails userDetails = new JwtUserDetails(userData.userId(), userData.gender());
                String token = jwtService.createToken(userDetails);

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(new TokenDTO(token, "nuevo_token_actualizacion")); // por el momento el token
                                                                                         // refresh es de juguete
        }

        @PostMapping("/token")
        @Operation(summary = "Iniciar sesión", description = "Autentica un usuario y devuelve tokens de acceso y actualización")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Inicio de sesión exitoso")
        })
        public ResponseEntity<TokenDTO> login(
                        @Parameter(description = "Encabezado de autorización básica con base64(email:contraseña)") @RequestHeader("Authorization") String authHeader) {
                // Implementación dummy
                return ResponseEntity.ok(new TokenDTO("token_acceso_dummy", "token_actualizacion_dummy"));
        }

        @DeleteMapping("/token")
        @Operation(summary = "Cerrar sesión", description = "Invalida el token de actualización del usuario")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Cierre de sesión exitoso")
        })
        public ResponseEntity<Void> logout(
                        @Parameter(description = "Token de actualización a invalidar") @RequestBody TokenDTO token) {
                // Implementación dummy
                return ResponseEntity.ok().build();
        }

        @PostMapping("/token/refresh")
        @Operation(summary = "Actualizar token", description = "Obtiene un nuevo token de acceso usando un token de actualización")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Token actualizado exitosamente")
        })
        public ResponseEntity<TokenDTO> refreshToken(
                        @Parameter(description = "Token de actualización") @RequestBody TokenDTO token) {
                // Implementación dummy
                return ResponseEntity.ok(new TokenDTO("nuevo_token_acceso", "nuevo_token_actualizacion"));
        }

        @GetMapping("/me")
        @Operation(summary = "Obtener mi perfil", description = "Obtiene la información del perfil del usuario actual")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Perfil obtenido exitosamente")
        })
        public ResponseEntity<UserProfileDTO> getMyProfile() {
                // Implementación dummy
                return ResponseEntity.ok(new UserProfileDTO(
                                "usuario123",
                                "usuario@ejemplo.com",
                                "Juan",
                                "Pérez",
                                "https://ejemplo.com/perfil.jpg",
                                LocalDate.of(1990, 1, 1),
                                "masculino"));
        }

        @PatchMapping("/me")
        @Operation(summary = "Actualizar mi perfil", description = "Actualiza la información del perfil del usuario actual")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Perfil actualizado exitosamente"),
                        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos")
        })
        public ResponseEntity<UserProfileDTO> updateMyProfile(
                        @Parameter(description = "Datos actualizados del perfil") @Valid @RequestBody UserProfileDTO userData) {
                // Implementación dummy
                return ResponseEntity.ok(userData);
        }

        @DeleteMapping("/me")
        @Operation(summary = "Eliminar mi perfil", description = "Elimina la cuenta del usuario actual")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Perfil eliminado exitosamente")
        })
        public ResponseEntity<Void> deleteMyProfile() {
                // Implementación dummy
                return ResponseEntity.noContent().build();
        }

        @GetMapping("/search")
        @Operation(summary = "Buscar usuarios", description = "Busca usuarios por nombre, apellido o email")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Búsqueda completada exitosamente")
        })
        public ResponseEntity<PaginatedResponse<UserSearchResultDTO>> searchUsers(
                        @Parameter(description = "Término de búsqueda") @RequestParam String query,
                        @Parameter(description = "Número de página (comienza en 1)") @RequestParam(defaultValue = "1") int page,
                        @Parameter(description = "Resultados por página") @RequestParam(defaultValue = "10") int limit) {
                // Implementación dummy
                var results = List.of(
                                new UserSearchResultDTO("usuario1", "Juan", "Pérez", "https://ejemplo.com/1.jpg",
                                                "masculino"),
                                new UserSearchResultDTO("usuario2", "María", "González", "https://ejemplo.com/2.jpg",
                                                "femenino"));
                var pagination = new PaginatedResponse.PaginationInfo(page, limit, 2, 1);
                return ResponseEntity.ok(new PaginatedResponse<>(results, pagination));
        }

        @PostMapping("/follow_requests/{targetUserId}")
        @Operation(summary = "Enviar solicitud de seguimiento", description = "Envía una solicitud de seguimiento a otro usuario")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Solicitud enviada exitosamente"),
                        @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
                        @ApiResponse(responseCode = "404", description = "Usuario objetivo no encontrado")
        })
        public ResponseEntity<Void> sendFollowRequest(
                        @Parameter(description = "ID del usuario objetivo") @PathVariable String targetUserId) {
                // Implementación dummy
                return ResponseEntity.status(HttpStatus.CREATED).build();
        }

        @PostMapping("/me/follow_requests/{requestId}/accept")
        @Operation(summary = "Aceptar solicitud de seguimiento", description = "Acepta una solicitud de seguimiento recibida")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Solicitud aceptada exitosamente"),
                        @ApiResponse(responseCode = "404", description = "Solicitud no encontrada")
        })
        public ResponseEntity<Void> acceptFollowRequest(
                        @Parameter(description = "ID de la solicitud") @PathVariable String requestId) {
                // Implementación dummy
                return ResponseEntity.ok().build();
        }

        @PostMapping("/me/follow_requests/{requestId}/reject")
        @Operation(summary = "Rechazar solicitud de seguimiento", description = "Rechaza una solicitud de seguimiento recibida")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Solicitud rechazada exitosamente"),
                        @ApiResponse(responseCode = "404", description = "Solicitud no encontrada")
        })
        public ResponseEntity<Void> rejectFollowRequest(
                        @Parameter(description = "ID de la solicitud") @PathVariable String requestId) {
                // Implementación dummy
                return ResponseEntity.ok().build();
        }

        @GetMapping("/{targetUserId}/followed")
        @Operation(summary = "Obtener usuarios seguidos", description = "Obtiene la lista de usuarios seguidos por un usuario específico")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente"),
                        @ApiResponse(responseCode = "404", description = "Usuario objetivo no encontrado")
        })
        public ResponseEntity<PaginatedResponse<UserSearchResultDTO>> getFollowedUsers(
                        @Parameter(description = "ID del usuario objetivo") @PathVariable String targetUserId,
                        @Parameter(description = "Número de página (comienza en 1)") @RequestParam(defaultValue = "1") int page,
                        @Parameter(description = "Resultados por página") @RequestParam(defaultValue = "10") int limit) {
                // Implementación dummy
                var results = List.of(
                                new UserSearchResultDTO("usuario1", "Juan", "Pérez", "https://ejemplo.com/1.jpg",
                                                "masculino"),
                                new UserSearchResultDTO("usuario2", "María", "González", "https://ejemplo.com/2.jpg",
                                                "femenino"));
                var pagination = new PaginatedResponse.PaginationInfo(page, limit, 2, 1);
                return ResponseEntity.ok(new PaginatedResponse<>(results, pagination));
        }

        @GetMapping("/{targetUserId}/followers")
        @Operation(summary = "Obtener seguidores", description = "Obtiene la lista de usuarios que siguen a un usuario específico")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente"),
                        @ApiResponse(responseCode = "404", description = "Usuario objetivo no encontrado")
        })
        public ResponseEntity<PaginatedResponse<UserSearchResultDTO>> getFollowers(
                        @Parameter(description = "ID del usuario objetivo") @PathVariable String targetUserId,
                        @Parameter(description = "Número de página (comienza en 1)") @RequestParam(defaultValue = "1") int page,
                        @Parameter(description = "Resultados por página") @RequestParam(defaultValue = "10") int limit) {
                // Implementación dummy
                var results = List.of(
                                new UserSearchResultDTO("usuario1", "Juan", "Pérez", "https://ejemplo.com/1.jpg",
                                                "masculino"),
                                new UserSearchResultDTO("usuario2", "María", "González", "https://ejemplo.com/2.jpg",
                                                "femenino"));
                var pagination = new PaginatedResponse.PaginationInfo(page, limit, 2, 1);
                return ResponseEntity.ok(new PaginatedResponse<>(results, pagination));
        }
}
