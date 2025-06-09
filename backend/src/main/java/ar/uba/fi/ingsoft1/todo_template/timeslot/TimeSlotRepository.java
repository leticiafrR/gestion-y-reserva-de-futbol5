package ar.uba.fi.ingsoft1.todo_template.timeslot;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    List<TimeSlot> findByFieldIdOrderByDayOfWeekAscOpenTimeAsc(Long fieldId);

    TimeSlot findByFieldIdAndDayOfWeek(Long fieldId, DayOfWeek day);

    void deleteByFieldId(Long fieldId);

    void deleteByFieldIdAndDayOfWeek(Long fieldId, DayOfWeek day);

    Optional<TimeSlot> findByFieldIdAndOpenTime(Long fieldId, int openTime);


}
