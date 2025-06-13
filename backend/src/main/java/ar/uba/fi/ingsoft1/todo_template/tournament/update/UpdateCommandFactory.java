package ar.uba.fi.ingsoft1.todo_template.tournament.update;

import java.math.BigDecimal;
import java.time.LocalDate;

import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentFormat;

public class UpdateCommandFactory {

    public static TournamentUpdateCommand createCommand(String fieldName, Object value) {
        return switch (fieldName) {
            case "name" -> new UpdateNameCommand((String) value);
            case "startDate" -> new UpdateStartDateCommand((LocalDate) value);
            case "format" -> new UpdateFormatCommand((TournamentFormat) value);
            case "maxTeams" -> new UpdateMaxTeamsCommand((Integer) value);
            case "endDate" -> new UpdateEndDateCommand((LocalDate) value);
            case "description" -> new UpdateDescriptionCommand((String) value);
            case "registrationFee" -> new UpdateRegistrationFeeCommand((BigDecimal) value);
            case "prizes" -> new UpdatePrizesCommand((String) value);
            default -> throw new IllegalArgumentException("Unknown field: " + fieldName);
        };
    }
}