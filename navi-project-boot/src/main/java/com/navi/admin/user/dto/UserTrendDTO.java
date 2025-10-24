package com.navi.admin.user.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserTrendDTO {
    private String period;
    private long join;
    private long leave;
    private long active;

}
