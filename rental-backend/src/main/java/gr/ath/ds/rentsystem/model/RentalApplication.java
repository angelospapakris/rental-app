package gr.ath.ds.rentsystem.model;

import gr.ath.ds.rentsystem.util.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "rental_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RentalApplication extends AbstractEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 2000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;

    // (User with role TENANT)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private User tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @PrePersist
    void prePersist() {
        if (status == null) status = ApplicationStatus.PENDING;
    }

    public void approve()         { this.status = ApplicationStatus.APPROVED; }
    public void reject()          { this.status = ApplicationStatus.REJECTED; }
}