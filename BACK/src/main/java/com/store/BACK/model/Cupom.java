package com.store.BACK.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "cupons")
@Getter
@Setter
public class Cupom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String codigo;

    @Column(nullable = false)
    private BigDecimal desconto;

    @Column(nullable = false)
    private String tipoDesconto; // "FIXO" ou "PERCENTUAL"

    @Column(nullable = false)
    private LocalDate dataValidade;
}