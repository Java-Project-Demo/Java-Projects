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
public class Category extends AbstractMappedEntity {
    private Long id;

    private String name;

    private String description;

    @Builder.Default
    private Boolean isDeleted = false;

    @Builder.Default
    private List<Product> items = new ArrayList<>();
}
