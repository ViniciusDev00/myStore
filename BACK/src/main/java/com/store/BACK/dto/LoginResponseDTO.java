package com.store.BACK.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Este DTO é usado para retornar o JWT após um login bem-sucedido.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {
    
    // O campo que conterá o token JWT
    private String token;
}