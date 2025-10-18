package com.store.BACK.service;

import com.store.BACK.model.Pedido;
import com.store.BACK.model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Pega o e-mail remetente do application.properties
    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Envia o e-mail inicial (Email 1) quando o pedido é criado.
     * Agora inclui as instruções de pagamento e o código Pix.
     */
    public void enviarConfirmacaoDePedido(Usuario usuario, Pedido pedido) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // Habilita o multipart para HTML e UTF-8 para acentos
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Japa Universe"); // Define o remetente com nome
            helper.setTo(usuario.getEmail());
            helper.setSubject("Japa Universe: Pedido #" + pedido.getId() + " aguardando pagamento");

            // Formata o valor para Reais (R$)
            String valorFormatado = formatarMoeda(pedido.getValorTotal());

            // --- ESTA É A SEÇÃO ATUALIZADA ---
            String htmlContent = "<div style='font-family: Arial, sans-serif; line-height: 1.6;'>"
                               + "<h2>Olá " + usuario.getNome() + "!</h2>"
                               + "<p>Seu pedido <strong>#" + pedido.getId() + "</strong> foi realizado com sucesso e está aguardando pagamento.</p>"
                               + "<p style='font-size: 1.2rem;'>Valor Total: <strong>" + valorFormatado + "</strong></p>"
                               + "<hr style='border: 0; border-top: 1px solid #eee;'>"
                               + "<h3>Pague com Pix para confirmar</h3>"
                               + "<p>Para finalizar seu pedido, copie o código abaixo e cole no seu aplicativo de banco na opção <strong>Pix Copia e Cola</strong>.</p>"
                               + "<p>O QR Code também está disponível na página de pagamento em nosso site.</p>"
                               + "<p style='font-weight: bold; margin-bottom: 5px;'>Pix Copia e Cola:</p>"
                               + "<pre style='background-color: #f4f4f4; border: 1px solid #ddd; padding: 15px; font-size: 0.9rem; line-height: 1.4; word-wrap: break-word; white-space: pre-wrap;'>"
                               + pedido.getPixCopiaECola() // Aqui está o código Pix
                               + "</pre>"
                               + "<p style='margin-top: 20px; font-size: 0.9rem; color: #555;'>"
                               + "Após o pagamento, iremos identificar automaticamente e alterar o status do seu pedido. Você receberá um novo e-mail assim que ele for confirmado."
                               + "</p>"
                               + "<br><p>Obrigado por comprar na <strong>Japa Universe</strong>!</p>"
                               + "</div>";
            // --- FIM DA SEÇÃO ATUALIZADA ---

            helper.setText(htmlContent, true); // true indica que é HTML

            mailSender.send(message);

        } catch (Exception e) {
            // Em um app real, logar esse erro é crucial
            System.err.println("Falha ao enviar e-mail de confirmação: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Envia o e-mail (Email 2) quando o pagamento é confirmado.
     * Este método deve ser chamado pelo seu AdminService quando o status for alterado para "PAGO".
     */
    public void enviarConfirmacaoPagamento(Usuario usuario, Pedido pedido) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Japa Universe");
            helper.setTo(usuario.getEmail());
            helper.setSubject("Japa Universe: Pagamento Confirmado! Pedido #" + pedido.getId());

            String valorFormatado = formatarMoeda(pedido.getValorTotal());

            String htmlContent = "<div style='font-family: Arial, sans-serif; line-height: 1.6;'>"
                               + "<h2>Oba, " + usuario.getNome() + "!</h2>"
                               + "<p>Recebemos a confirmação do seu pagamento para o pedido <strong>#" + pedido.getId() + "</strong> no valor de <strong>" + valorFormatado + "</strong>.</p>"
                               + "<p>Seu pedido está agora com o status: <strong>PAGO</strong>.</p>"
                               + "<p>Já estamos separando seus produtos e em breve ele será enviado.</p>"
                               + "<br><p>Obrigado por comprar na <strong>Japa Universe</strong>!</p>"
                               + "</div>";

            helper.setText(htmlContent, true); 

            mailSender.send(message);

        } catch (Exception e) {
            System.err.println("Falha ao enviar e-mail de pagamento confirmado: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Método utilitário para formatar BRL (R$)
    private String formatarMoeda(BigDecimal valor) {
        Locale ptBr = new Locale("pt", "BR");
        return NumberFormat.getCurrencyInstance(ptBr).format(valor);
    }
}