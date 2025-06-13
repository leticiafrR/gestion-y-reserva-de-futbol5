package ar.uba.fi.ingsoft1.todo_template.field;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FieldRepository extends JpaRepository<Field, Long> {
    boolean existsByNameAndAddress(String name, String address);
    boolean existsByNameAndAddressAndIdNot(String name, String address, Long id);
    Optional<Field> findByIdAndOwner(Long id, User owner);
    List<Field> findByOwner(User owner);
    List<Field> findByActiveTrue();
    Field findById(long id);

}
