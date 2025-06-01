package ar.uba.fi.ingsoft1.todo_template.field;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FieldRepository extends JpaRepository<Field, Long> {
    boolean existsByNameAndAddress(String name, String address);
    List<Field> findByOwnerEmail(String ownerEmail);
    Optional<Field> findByIdAndOwnerEmail(Long id, String ownerEmail);
    boolean existsByNameAndAddressAndIdNot(String name, String address, Long id);
}

