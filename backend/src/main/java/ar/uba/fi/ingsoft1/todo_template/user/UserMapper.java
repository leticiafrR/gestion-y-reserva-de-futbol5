package ar.uba.fi.ingsoft1.todo_template.user;

import java.time.Year;

import org.springframework.stereotype.Component;

import ar.uba.fi.ingsoft1.todo_template.user.dto.UserProfileDTO;

@Component
public class UserMapper {

    public UserProfileDTO toUserProfileDTO(User user) {
        int currentYear = Year.now().getValue();
        String age = String.valueOf(currentYear - user.getBirthYear());

        return new UserProfileDTO(
                user.username(),
                user.getName(),
                user.getLastName(),
                age,
                user.getGender(),
                user.getZone(),
                user.getRole());
    }
}
