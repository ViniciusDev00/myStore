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

    // NOVO MÉTODO: Usado pelo AdminService para notificar pagamento
    public void enviarConfirmacaoPagamento(Pedido pedido) {
        // Reutiliza a lógica de confirmação do pedido
        enviarConfirmacaoDePedido(pedido);
    }

    // MÉTODO AJUSTADO: Usado pelo PedidoService para confirmar pedido
    public void enviarConfirmacaoDePedido(Pedido pedido) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // CORREÇÕES: getClient() -> getUsuario(), getTotal() -> getValorTotal()
            String htmlContent = "<h1>Confirmação de Pedido</h1>"
                    + "<p>Obrigado por seu pedido, " + pedido.getUsuario().getNome() + "!</p>"
                    + "<p>Seu pedido #" + pedido.getId() + " foi recebido e está sendo processado.</p>"
                    + "<p>Total: R$ " + String.format("%.2f", pedido.getValorTotal()) + "</p>"
                    + "<h2>Itens do Pedido:</h2>";

            htmlContent += "<ul>";
            for (ItemPedido item : pedido.getItens()) {
                // CORREÇÃO: getPreco() -> getPrecoUnitario()
                htmlContent += "<li>" + item.getProduto().getNome() + " - "
                        + item.getQuantidade() + " x R$ " + String.format("%.2f", item.getPrecoUnitario())
                        + " (Tamanho: " + item.getTamanho() + ")"
                        + "</li>";
            }
            htmlContent += "</ul>";

            // CORREÇÃO: getEndereco() -> getEnderecoDeEntrega() e removido getBairro()
            htmlContent += "<h2>Endereço de Entrega:</h2>"
                    + "<p>" + pedido.getEnderecoDeEntrega().getRua() + ", " + pedido.getEnderecoDeEntrega().getNumero() + "</p>"
                    + "<p>" + pedido.getEnderecoDeEntrega().getCidade() + " - " + pedido.getEnderecoDeEntrega().getEstado() + "</p>"
                    + "<p>CEP: " + pedido.getEnderecoDeEntrega().getCep() + "</p>";

            // CORREÇÃO: getClient() -> getUsuario()
            helper.setTo(pedido.getUsuario().getEmail());
            helper.setSubject("Confirmação de Pedido #" + pedido.getId());
            helper.setText(htmlContent, true);
            helper.setFrom("nao-responda@japauniverse.com.br");

            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    // MÉTODO PARA REDEFINIÇÃO DE SENHA
    public void sendPasswordResetEmail(String to, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String url = "http://127.0.0.1:5500/FRONT/login/HTML/nova-senha.html?token=" + token;

            String htmlContent = "<h1>Redefinição de Senha - JapaUniverse</h1>"
                    + "<p>Você solicitou a redefinição da sua senha.</p>"
                    + "<p>Clique no link abaixo para criar uma nova senha (o link expira em 1 hora):</p>"
                    + "<a href=\"" + url + "\" style=\"background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;\">Redefinir Senha</a>"
                    + "<p>Se você não solicitou isso, por favor ignore este e-mail.</p>";

            helper.setTo(to);
            helper.setSubject("JapaUniverse - Redefinição de Senha");
            helper.setText(htmlContent, true);
            helper.setFrom("nao-responda@japauniverse.com.br");

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Falha ao enviar e-mail de redefinição de senha", e);
        }
    }
}