package ar.uba.fi.ingsoft1.todo_template.booking;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByTimeSlot_Field_IdAndActiveTrue(Long fieldId);
    List<Booking> findByUser_IdAndActiveTrue(Long userId);
    List<Booking> findByTimeSlot_Field_Owner_UsernameAndActiveTrue(String username);
    List<Booking> findByTimeSlot_Field_IdInAndActiveTrue(List<Long> fieldIds);

}
