package com.store.BACK.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "pedidos")
@Getter
@Setter
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private LocalDateTime dataPedido;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Column(columnDefinition = "TEXT")
    private String pixCopiaECola;

    @ManyToOne(fetch = FetchType.EAGER) // EAGER para que venha com o pedido
    @JoinColumn(name = "endereco_id", nullable = false)
    private Endereco enderecoDeEntrega;

    // --- NOVOS CAMPOS ADICIONADOS ---
    @Column(name = "nome_destinatario")
    private String nomeDestinatario;

    @Column(name = "telefone_destinatario")
    private String telefoneDestinatario;

    @Column(name = "cpf_destinatario")
    private String cpfDestinatario;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;
    // --- FIM NOVOS CAMPOS ---

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("pedido-itens")
    private List<ItemPedido> itens;
}