package ar.uba.fi.ingsoft1.todo_template.team;

import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamDetailsDTO {
    private Long id;
    private String name;
    private String captain;
    private String primaryColor;
    private String secondaryColor;
    private String logo;
    private List<String> membersUsernames;

    public static TeamDetailsDTO toTeamDetailsDTO(Team team){
        return TeamDetailsDTO.builder()
                .id(team.getId())
                .name(team.getName())
                .captain(team.getCaptain())
                .primaryColor(team.getPrimaryColor())
                .secondaryColor(team.getSecondaryColor())
                .logo(team.getLogo())
                .membersUsernames(team.getMemberNames() != null ? team.getMemberNames() : List.of())
                .build();
    }

    public static List<TeamDetailsDTO> toTeamDetailsDTOS(List<Team> teams){
        return teams.stream()
                .map(TeamDetailsDTO::toTeamDetailsDTO)
                .collect(Collectors.toList());
    }
}
