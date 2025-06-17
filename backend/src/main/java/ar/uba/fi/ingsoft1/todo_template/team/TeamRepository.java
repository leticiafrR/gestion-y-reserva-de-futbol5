package ar.uba.fi.ingsoft1.todo_template.team;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Long> {

    Optional<Team> findByName(String name);

    List<Team> findByMembers(User user);

    @Query("SELECT DISTINCT t FROM Team t JOIN FETCH t.members")
    List<Team> findAllWithMembers();

    @Query("""
                SELECT DISTINCT t
                FROM Team t
                JOIN FETCH t.members
                WHERE t IN (
                    SELECT t2
                    FROM Team t2
                    JOIN t2.members m2
                    WHERE m2.id = :userId
                )
            """)
    List<Team> findAllByMemberIdFetchMembers(@Param("userId") Long userId);

    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN TRUE ELSE FALSE END " +
            "FROM Team t JOIN t.members m " +
            "WHERE t.id = :teamId AND m.username = :username")
    boolean existsByIdAndMemberUsername(@Param("teamId") Long teamId,
            @Param("username") String username);

}