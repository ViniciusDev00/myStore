// Local: BACK/src/main/java/com/store/BACK/service/EmailService.java
package com.store.BACK.service;

import com.store.BACK.model.ItemPedido;
import com.store.BACK.model.Pedido;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    // SEU MÉTODO ORIGINAL (COPIADO DO ARQUIVO)
    public void sendOrderConfirmationEmail(Pedido pedido) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Construa o conteúdo HTML do e-mail
            String htmlContent = "<h1>Confirmação de Pedido</h1>"
                    + "<p>Obrigado por seu pedido, " + pedido.getClient().getNome() + "!</p>"
                    + "<p>Seu pedido #" + pedido.getId() + " foi recebido e está sendo processado.</p>"
                    + "<p>Total: R$ " + String.format("%.2f", pedido.getTotal()) + "</p>"
                    + "<h2>Itens do Pedido:</h2>";
            
            htmlContent += "<ul>";
            for (ItemPedido item : pedido.getItens()) {
                htmlContent += "<li>" + item.getProduto().getNome() + " - " 
                            + item.getQuantidade() + " x R$ " + String.format("%.2f", item.getPreco()) 
                            + " (Tamanho: " + item.getTamanho() + ")"
                            + "</li>";
            }
            htmlContent += "</ul>";
            
            htmlContent += "<h2>Endereço de Entrega:</h2>"
                    + "<p>" + pedido.getEndereco().getRua() + ", " + pedido.getEndereco().getNumero() + "</p>"
                    + "<p>" + pedido.getEndereco().getBairro() + ", " + pedido.getEndereco().getCidade() + " - " + pedido.getEndereco().getEstado() + "</p>"
                    + "<p>CEP: " + pedido.getEndereco().getCep() + "</p>";

            helper.setTo(pedido.getClient().getEmail());
            helper.setSubject("Confirmação de Pedido #" + pedido.getId());
            helper.setText(htmlContent, true);
            helper.setFrom("nao-responda@japauniverse.com.br"); // Configure isso no seu application.properties

            mailSender.send(message);
        } catch (MessagingException e) {
            // Trate a exceção (ex: logar o erro)
            e.printStackTrace();
        }
    }

    // NOVO MÉTODO PARA REDEFINIÇÃO DE SENHA
    public void sendPasswordResetEmail(String to, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // !! IMPORTANTE !!
            // Este URL deve apontar para sua página de "nova senha" no FRONT-END
            // Para testes locais, pode ser isso:
            String url = "http://127.0.0.1:5500/FRONT/login/HTML/nova-senha.html?token=" + token;

            String htmlContent = "<h1>Redefinição de Senha - JapaUniverse</h1>"
                               + "<p>Você solicitou a redefinição da sua senha.</p>"
                               + "<p>Clique no link abaixo para criar uma nova senha (o link expira em 1 hora):</p>"
                               + "<a href=\"" + url + "\" style=\"background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;\">Redefinir Senha</a>"
                               + "<p>Se você não solicitou isso, por favor ignore este e-mail.</p>";

            helper.setTo(to);
            helper.setSubject("JapaUniverse - Redefinição de Senha");
            helper.setText(htmlContent, true);
            helper.setFrom("nao-responda@japauniverse.com.br"); // Deve ser o mesmo e-mail configurado

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Falha ao enviar e-mail de redefinição de senha", e);
        }
    }
}
