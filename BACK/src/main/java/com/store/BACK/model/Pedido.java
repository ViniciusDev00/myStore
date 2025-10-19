package com.store.BACK.model;

import com.fasterxml.jackson.annotation.JsonManagedReference; // Mantenha este import
// import com.fasterxml.jackson.annotation.JsonBackReference; // REMOVA ou comente este import

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER) // MUDANÇA: Pode ser útil mudar para EAGER aqui
    @JoinColumn(name = "usuario_id", nullable = false)
    // @JsonBackReference // <<<--- ANOTAÇÃO REMOVIDA DAQUI
    private Usuario usuario;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER) // MUDANÇA: Pode ser útil EAGER aqui também
    @JsonManagedReference // Esta é a referência principal, que será incluída
    private List<ItemPedido> itens = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime dataPedido;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Column(nullable = false, length = 50)
    private String status; // Ex: PENDENTE, PAGO, ENVIADO, ENTREGUE, CANCELADO

    @Column(length = 1000) // Aumente se o código PIX for muito longo
    private String pixCopiaECola;

    // Construtores, getters, setters (gerados pelo Lombok @Getter @Setter)

    // Métodos utilitários (se necessário), por exemplo:
    public void addItem(ItemPedido item) {
        itens.add(item);
        item.setPedido(this);
    }

    public void removeItem(ItemPedido item) {
        itens.remove(item);
        item.setPedido(null);
    }
}