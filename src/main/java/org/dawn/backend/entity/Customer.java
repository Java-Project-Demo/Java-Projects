package org.dawn.backend.entity;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true, exclude = "items")
@ToString(callSuper = true, exclude = "items")
public class Customer extends AbstractMappedEntity {
    private Long id;

    private String phoneNumber;

    private String fullName;

    private String email;

    private String address;

    @Builder.Default
    private List<Order> items = new ArrayList<>();
}
