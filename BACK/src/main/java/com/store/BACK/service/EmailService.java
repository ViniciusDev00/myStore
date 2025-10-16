package com.store.BACK.service;

import com.store.BACK.model.ItemPedido;
import com.store.BACK.model.Pedido;
import com.store.BACK.model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void enviarConfirmacaoDePedido(Usuario usuario, Pedido pedido) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            helper.setTo(usuario.getEmail());
            helper.setFrom("seu-email@gmail.com"); // Substitua pelo seu e-mail de envio
            helper.setSubject("Confirmação do seu Pedido - Japa Universe");

            String content = buildEmailContent(usuario, pedido);
            helper.setText(content, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            // Logar o erro ou lidar com ele de forma apropriada
            e.printStackTrace();
        }
    }

    private String buildEmailContent(Usuario usuario, Pedido pedido) {
        StringBuilder itemsHtml = new StringBuilder();
        for (ItemPedido item : pedido.getItens()) {
            itemsHtml.append("<tr>")
                    .append("<td style='padding: 8px; border-bottom: 1px solid #ddd;'>").append(item.getProduto().getNome()).append(" (Tamanho: ").append(item.getTamanho()).append(")</td>")
                    .append("<td style='padding: 8px; border-bottom: 1px solid #ddd;'>").append(item.getQuantidade()).append("</td>")
                    // --- CORREÇÃO APLICADA AQUI ---
                    .append("<td style='padding: 8px; border-bottom: 1px solid #ddd;'>R$ ").append(String.format("%.2f", item.getPrecoUnitario())).append("</td>")
                    .append("</tr>");
        }
    
        return "<!DOCTYPE html>..." + // Corpo do HTML do e-mail
               "<h2>Olá, " + usuario.getNome() + "!</h2>" +
               "<p>Obrigado por comprar na Japa Universe. Seu pedido #" + pedido.getId() + " foi recebido e está sendo processado.</p>" +
               "<h3>Detalhes do Pedido:</h3>" +
               "<table style='width: 100%; border-collapse: collapse;'>" +
               "<thead><tr><th style='text-align: left; padding: 8px; background-color: #f2f2f2;'>Produto</th><th style='text-align: left; padding: 8px; background-color: #f2f2f2;'>Qtd</th><th style='text-align: left; padding: 8px; background-color: #f2f2f2;'>Preço</th></tr></thead>" +
               "<tbody>" + itemsHtml.toString() + "</tbody>" +
               "</table>" +
               // --- CORREÇÃO APLICADA AQUI ---
               "<h3 style='text-align: right;'>Total: R$ " + String.format("%.2f", pedido.getValorTotal()) + "</h3>" +
               "<p>Atenciosamente,<br>Equipe Japa Universe</p>";
    }    
}
