package com.store.BACK.service;

import com.store.BACK.model.ItemPedido;
import com.store.BACK.model.Pedido;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOrderConfirmationEmail(Pedido pedido) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            String to = pedido.getUsuario().getEmail();
            String subject = "Confirmação do seu Pedido #" + pedido.getId() + " na Japa Universe";
            String htmlBody = buildOrderConfirmationHtml(pedido);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true indica que o conteúdo é HTML

            mailSender.send(message);
        } catch (MessagingException e) {
            // Em um projeto real, é bom logar esse erro
            System.err.println("Erro ao enviar email de confirmação: " + e.getMessage());
        }
    }

    private String buildOrderConfirmationHtml(Pedido pedido) {
        StringBuilder sb = new StringBuilder();
        sb.append("<html><body style='font-family: Arial, sans-serif; color: #333;'>");
        sb.append("<h1 style='color: #5e35b1;'>Obrigado pela sua compra, ").append(pedido.getUsuario().getNome()).append("!</h1>");
        sb.append("<p>Seu pedido <strong>#").append(pedido.getId()).append("</strong> foi recebido e está sendo processado.</p>");
        sb.append("<h2>Detalhes do Pedido:</h2>");
        sb.append("<table border='1' cellpadding='10' style='border-collapse: collapse; width: 100%;'>");
        sb.append("<thead style='background-color: #f2f2f2;'><tr><th>Produto</th><th>Quantidade</th><th>Preço</th></tr></thead>");
        sb.append("<tbody>");

        for (ItemPedido item : pedido.getItens()) {
            sb.append("<tr>");
            sb.append("<td>").append(item.getProduto().getNome()).append("</td>");
            sb.append("<td style='text-align: center;'>").append(item.getQuantidade()).append("</td>");
            sb.append("<td style='text-align: right;'>R$ ").append(String.format("%.2f", item.getPreco())).append("</td>");
            sb.append("</tr>");
        }

        sb.append("</tbody></table>");
        sb.append("<h3 style='text-align: right; margin-top: 20px;'>Total: R$ ").append(String.format("%.2f", pedido.getTotal())).append("</h3>");
        sb.append("<p>Enviaremos uma nova notificação assim que seu pedido for enviado.</p>");
        sb.append("<p>Atenciosamente,<br>Equipe Japa Universe</p>");
        sb.append("</body></html>");

        return sb.toString();
    }
}