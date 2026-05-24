package org.dawn.backend.entity;

import io.swagger.v3.oas.annotations.Hidden;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.inventory.DetailStatus;

@Entity
@Table(name = "inventory_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Hidden
@EqualsAndHashCode(callSuper = false, exclude = {"expectedLocation", "actualLocation"})
@ToString(exclude = {"expectedLocation", "actualLocation"})
public class InventoryDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @Column(name = "session_id")
    private Long sessionId;

    @Column(name = "imei", length = 50)
    private String imei;

    @Column(name = "expected_loc")
    private Long expectedLoc;

    @Column(name = "actual_loc")
    private Long actualLoc;

    @Column(name = "record_status", length = 20)
    @Enumerated(EnumType.STRING)
    private DetailStatus recordStatus;

    @Column(name = "note", length = 255)
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expected_location", insertable = false, updatable = false)
    private WarehouseLocation expectedLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actual_loc", insertable = false, updatable = false)
    private WarehouseLocation actualLocation;

}
