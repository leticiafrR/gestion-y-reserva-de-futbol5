package ar.uba.fi.ingsoft1.todo_template.field;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import jakarta.persistence.*;

@Entity
public class Field {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String grassType;

    @Column(nullable = false)
    private boolean lighting;

    @Column(nullable = false)
    private String zone;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String photoUrl;

    @Column(nullable = false)
    private Double price;

    @ManyToOne(optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private boolean active = true;

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getGrassType() { return grassType; }
    public void setGrassType(String grassType) { this.grassType = grassType; }
    public boolean isLighting() { return lighting; }
    public void setLighting(boolean lighting) { this.lighting = lighting; }
    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
