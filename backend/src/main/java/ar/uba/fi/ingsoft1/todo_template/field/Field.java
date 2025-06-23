package ar.uba.fi.ingsoft1.todo_template.field;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Field {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String grassType;

    @Column(nullable = false)
    private Boolean lighting;

    @Column(nullable = false)
    private Boolean roofing = false;

    @Column(nullable = false)
    private String zone;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String photoUrl;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Boolean active = true;

    @ManyToOne(optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

}
