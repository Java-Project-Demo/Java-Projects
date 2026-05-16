package org.dawn.backend.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class LocationItemMini {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private String imei;
    private String status;
}
