package com.store.BACK.service;

import com.store.BACK.model.Pedido;
import com.store.BACK.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private EmailService emailService; // Injetando o serviço de email

    public List<Pedido> findAll() {
        return pedidoRepository.findAll();
    }

    public Pedido findById(Long id) {
        return pedidoRepository.findById(id).orElse(null);
    }

    @Transactional
    public Pedido createPedido(Pedido pedido) {
        // Salva o pedido no banco de dados
        Pedido savedPedido = pedidoRepository.save(pedido);
        
        // Envia o email de confirmação após o pedido ser salvo com sucesso
        try {
            emailService.sendOrderConfirmationEmail(savedPedido);
        } catch (Exception e) {
            // Mesmo que o email falhe, o pedido foi criado.
            // É importante logar o erro do email para análise posterior.
            System.err.println("Pedido " + savedPedido.getId() + " criado, mas falha ao enviar email: " + e.getMessage());
        }

        return savedPedido;
    }
}