package ar.uba.fi.ingsoft1.todo_template.blockedslot;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BlockedSlotRepository extends JpaRepository<BlockedSlot, Long> {
    List<BlockedSlot> findByFieldIdAndDate(Long fieldId, LocalDate date);
}
