package com.store.BACK.dto;

import java.util.List;

public class CheckoutRequestDTO {

    private List<ItemPedidoDTO> itens;
    private Long enderecoEntregaId;

    // Campos de Destinatário
    private String nomeDestinatario;
    private String telefoneDestinatario;
    private String cpfDestinatario;
    private String observacoes;

    // Novos campos de opções
    private boolean comCaixa;
    private boolean entregaPrioritaria;

    public CheckoutRequestDTO() {}

    // Getters e Setters para todos os campos (Manuais para evitar problemas com Lombok)

    public String getNomeDestinatario() {
        return nomeDestinatario;
    }

    public void setNomeDestinatario(String nomeDestinatario) {
        this.nomeDestinatario = nomeDestinatario;
    }

    public String getTelefoneDestinatario() {
        return telefoneDestinatario;
    }

    public void setTelefoneDestinatario(String telefoneDestinatario) {
        this.telefoneDestinatario = telefoneDestinatario;
    }

    public List<ItemPedidoDTO> getItens() {
        return itens;
    }

    public void setItens(List<ItemPedidoDTO> itens) {
        this.itens = itens;
    }

    public Long getEnderecoEntregaId() {
        return enderecoEntregaId;
    }

    public void setEnderecoEntregaId(Long enderecoEntregaId) {
        this.enderecoEntregaId = enderecoEntregaId;
    }

    public String getCpfDestinatario() {
        return cpfDestinatario;
    }

    public void setCpfDestinatario(String cpfDestinatario) {
        this.cpfDestinatario = cpfDestinatario;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public boolean isComCaixa() {
        return comCaixa;
    }

    public void setComCaixa(boolean comCaixa) {
        this.comCaixa = comCaixa;
    }

    public boolean isEntregaPrioritaria() {
        return entregaPrioritaria;
    }

    public void setEntregaPrioritaria(boolean entregaPrioritaria) {
        this.entregaPrioritaria = entregaPrioritaria;
    }
}