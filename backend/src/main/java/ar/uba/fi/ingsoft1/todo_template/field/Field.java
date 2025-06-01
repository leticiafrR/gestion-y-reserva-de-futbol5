package ar.uba.fi.ingsoft1.todo_template.field;

import jakarta.persistence.*;

@Entity
public class Field {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String grassType;
    private boolean lighting;
    private String zone;
    private String address;
    private String photoUrl;
    private String ownerEmail;
    private boolean active = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }

    public boolean isActive() { return active; }
    public void setIdle() { this.active = false;  }

}
