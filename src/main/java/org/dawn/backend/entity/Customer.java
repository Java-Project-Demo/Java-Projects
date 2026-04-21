package org.dawn.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true, exclude = "items")
public class Customer extends AbstractMappedEntity {
    private Long id;

    private String phoneNumber;

    private String fullName;

    private String email;

    private String address;

    private List<Order> items;
}
