package ar.uba.fi.ingsoft1.todo_template.team.DTO;

import ar.uba.fi.ingsoft1.todo_template.team.Team;
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

    public static TeamDetailsDTO fromTeam(Team team){
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

    public static List<TeamDetailsDTO> fromTeamList(List<Team> teams){
        return teams.stream()
                .map(TeamDetailsDTO::fromTeam)
                .collect(Collectors.toList());
    }
}
