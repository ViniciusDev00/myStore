package com.store.BACK.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "produtos")
@Getter
@Setter
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(length = 1000)
    private String descricao;

    @Column(nullable = false)
    private BigDecimal preco;

    private String imagemUrl;

    @Column(nullable = false)
    private int estoque;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "marca_id", nullable = false)
    @JsonManagedReference("marca-produtos") // <-- ATUALIZAÇÃO
    private Marca marca;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoria_id", nullable = false)
    @JsonManagedReference("categoria-produtos") // <-- ATUALIZAÇÃO
    private Categoria categoria;
}