package gr.ath.ds.rentsystem.model;

import gr.ath.ds.rentsystem.util.enums.ViewingStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "viewing_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ViewingRequest extends AbstractEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime requestedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ViewingStatus status;

    @Column(length = 2000)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private User tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @PrePersist
    void prePersist() {
        if (status == null) status = ViewingStatus.REQUESTED;
        if (requestedAt == null) requestedAt = LocalDateTime.now();
    }
}
