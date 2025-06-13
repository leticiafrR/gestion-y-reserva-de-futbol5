package ar.uba.fi.ingsoft1.todo_template.tournament;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.AbstractMap;
import java.util.Arrays;
import java.util.List;

import ar.uba.fi.ingsoft1.todo_template.tournament.update.TournamentUpdateCommand;
import ar.uba.fi.ingsoft1.todo_template.tournament.update.UpdateCommandFactory;

public record TournamentUpdateDTO(
                String name,
                LocalDate startDate,
                TournamentFormat format,
                @Positive Integer maxTeams,
                LocalDate endDate,
                String description,
                String prizes,
                @PositiveOrZero BigDecimal registrationFee) {

        public List<TournamentUpdateCommand> toCommands() {
                return Arrays.stream(this.getClass().getRecordComponents())
                                .map(rc -> {
                                        try {
                                                Object value = rc.getAccessor().invoke(this);
                                                return new AbstractMap.SimpleEntry<>(rc.getName(), value);
                                        } catch (ReflectiveOperationException e) {
                                                throw new RuntimeException(e);
                                        }
                                })
                                .filter(entry -> entry.getValue() != null)
                                .map(entry -> UpdateCommandFactory.createCommand(entry.getKey(), entry.getValue()))
                                .toList();
        }

}
