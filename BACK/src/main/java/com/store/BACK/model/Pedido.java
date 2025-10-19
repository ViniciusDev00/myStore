package com.store.BACK.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
@Getter
@Setter
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonBackReference("usuario-pedidos")
    private Usuario usuario;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("pedido-itens")
    private List<ItemPedido> itens = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "endereco_entrega_id")
    private Endereco enderecoDeEntrega;

    @OneToOne(mappedBy = "pedido", cascade = CascadeType.ALL)
    @JsonManagedReference("pedido-pagamento")
    private Pagamento pagamento;

    @Column(nullable = false)
    private BigDecimal valorTotal;

    @Column(nullable = false)
    private LocalDateTime dataPedido;

    @Column(nullable = false)
    private String status;

    // NOVO CAMPO ADICIONADO
    @Column(length = 1000) // Coluna para armazenar o código Pix
    private String pixCopiaECola;
}