package com.store.BACK.model;

import com.fasterxml.jackson.annotation.JsonBackReference; // IMPORTANTE: Mude a importação
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagamentos")
@Getter
@Setter
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "pedido_id", nullable = false)
    // --- A CORREÇÃO ESTÁ AQUI ---
    @JsonBackReference("pedido-pagamento") // Troque @JsonIgnore por esta linha
    private Pedido pedido;

    @Column(nullable = false)
    private String metodo;

    @Column(nullable = false)
    private String status;

    private LocalDateTime dataPagamento;

    @Column(nullable = false)
    private BigDecimal valor;
}