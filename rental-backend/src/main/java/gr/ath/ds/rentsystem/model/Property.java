package gr.ath.ds.rentsystem.model;

import gr.ath.ds.rentsystem.util.enums.PropertyStatus;
import gr.ath.ds.rentsystem.util.enums.PropertyType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Property extends AbstractEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private int bedrooms;

    @Column(nullable = false)
    private int bathrooms;

    @Column(nullable = false)
    private int size;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyType type; // APARTMENT, HOUSE, STUDIO

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyStatus status; // PENDING, APPROVED, REJECTED

    // (User with role OWNER)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    public boolean isAvailable() {
        return this.status == PropertyStatus.APPROVED;
    }
}
