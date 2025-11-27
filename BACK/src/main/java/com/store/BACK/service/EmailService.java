package com.store.BACK.service;

import com.store.BACK.model.ItemPedido;
import com.store.BACK.model.Pedido;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async; // NOVO: Importação essencial para a execução assíncrona

import java.io.UnsupportedEncodingException;
import java.time.format.DateTimeFormatter;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    // Sistema de cores profissionais da marca
    private final String COLOR_PRIMARY = "#ff7a00";
    private final String COLOR_PRIMARY_LIGHT = "#ff9a3d";
    private final String COLOR_PRIMARY_DARK = "#e56a00";
    private final String COLOR_BG = "#f8f9fa";
    private final String COLOR_CARD = "#ffffff";
    private final String COLOR_TEXT = "#2d3748";
    private final String COLOR_TEXT_LIGHT = "#718096";
    private final String COLOR_BORDER = "#e2e8f0";
    private final String COLOR_SUCCESS = "#48bb78";
    private final String COLOR_WARNING = "#ed8936";
    private final String COLOR_ERROR = "#f56565";

    public void enviarConfirmacaoPagamento(Pedido pedido) {
        // Este método pode chamar o método assíncrono diretamente.
        enviarConfirmacaoDePedido(pedido);
    }

    @Async // ANOTAÇÃO ADICIONADA: O envio do email será executado em uma nova thread.
    public void enviarConfirmacaoDePedido(Pedido pedido) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Formatação de Valores
            String totalFormatado = String.format("%.2f", pedido.getValorTotal());
            String dataPedido = pedido.getDataPedido().format(DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm"));

            // Constrói a lista de itens em HTML profissional
            StringBuilder itensHtml = new StringBuilder();
            itensHtml.append("<table width='100%' cellpadding='12' cellspacing='0' style='border-collapse: separate; border-spacing: 0; margin: 20px 0; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);'>");
            itensHtml.append("<thead>")
                    .append("<tr style='background: linear-gradient(135deg, ").append(COLOR_PRIMARY).append(", ").append(COLOR_PRIMARY_LIGHT).append("); color: white;'>")
                    .append("<th align='left' style='padding: 12px; font-weight: 600;'>Produto</th>")
                    .append("<th align='center' style='padding: 12px; font-weight: 600;'>Qtd</th>")
                    .append("<th align='right' style='padding: 12px; font-weight: 600;'>Valor</th>")
                    .append("</tr>")
                    .append("</thead>")
                    .append("<tbody>");

            for (ItemPedido item : pedido.getItens()) {
                String precoItem = String.format("%.2f", item.getPrecoUnitario());
                // CORREÇÃO: Usar multiply() para BigDecimal
                BigDecimal totalItemValue = item.getPrecoUnitario().multiply(BigDecimal.valueOf(item.getQuantidade()));
                String totalItem = String.format("%.2f", totalItemValue);

                itensHtml.append("<tr style='background-color: white; border-bottom: 1px solid ").append(COLOR_BORDER).append(";'>")
                        .append("<td style='padding: 12px; color: ").append(COLOR_TEXT).append(";'>")
                        .append("<div style='font-weight: 600; margin-bottom: 4px;'>").append(item.getProduto().getNome()).append("</div>")
                        .append("<div style='font-size: 13px; color: ").append(COLOR_TEXT_LIGHT).append(";'>Tamanho: ").append(item.getTamanho()).append("</div>")
                        .append("</td>")
                        .append("<td align='center' style='padding: 12px; color: ").append(COLOR_TEXT).append("; font-weight: 500;'>").append(item.getQuantidade()).append("</td>")
                        .append("<td align='right' style='padding: 12px; color: ").append(COLOR_TEXT).append(";'>")
                        .append("<div style='font-weight: 600;'>R$ ").append(totalItem).append("</div>")
                        .append("<div style='font-size: 12px; color: ").append(COLOR_TEXT_LIGHT).append(";'>R$ ").append(precoItem).append(" un</div>")
                        .append("</td>")
                        .append("</tr>");
            }

            // Linha do total
            itensHtml.append("<tr style='background-color: ").append(COLOR_BG).append(";'>")
                    .append("<td colspan='2' align='right' style='padding: 12px; font-weight: 600; color: ").append(COLOR_TEXT).append(";'>Total:</td>")
                    .append("<td align='right' style='padding: 12px; font-weight: 700; font-size: 16px; color: ").append(COLOR_PRIMARY).append(";'>R$ ").append(totalFormatado).append("</td>")
                    .append("</tr>");

            itensHtml.append("</tbody></table>");

            // Monta o corpo do e-mail profissional
            String bodyContent =
                    "<div style='text-align: center; margin-bottom: 30px;'>" +
                            // ========== AQUI VOCÊ PODE COLOCAR UMA IMAGEM PERSONALIZADA NO CHECK ==========
                            // Para usar imagem em vez do ✓, substitua as 3 linhas abaixo por:
                            // "<img src='SUA_URL_DA_IMAGEM_DO_CHECK_AQUI' alt='Confirmado' style='width: 80px; height: 80px; margin-bottom: 15px;'>" +
                            "<div style='background: linear-gradient(135deg, " + COLOR_PRIMARY + ", " + COLOR_PRIMARY_LIGHT + "); width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;'>" +
                            "<span style='color: white; font-size: 24px;'>✓</span>" +
                            "</div>" +
                            // =================================================================================
                            "<h1 style='color: " + COLOR_TEXT + "; margin: 0 0 10px 0; font-size: 28px;'>Pedido Confirmado!</h1>" +
                            "<p style='color: " + COLOR_TEXT_LIGHT + "; margin: 0; font-size: 16px;'>Obrigado pela sua compra, " + pedido.getUsuario().getNome() + "!</p>" +
                            "</div>" +

                            "<div style='background: linear-gradient(135deg, " + COLOR_PRIMARY + ", " + COLOR_PRIMARY_LIGHT + "); padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center; color: white;'>" +
                            "<div style='font-size: 13px; opacity: 0.9; margin-bottom: 5px;'>NÚMERO DO PEDIDO</div>" +
                            "<div style='font-size: 24px; font-weight: 700; letter-spacing: 1px;'>#" + pedido.getId() + "</div>" +
                            "</div>" +

                            "<div style='display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0;'>" +
                            "<div style='background-color: " + COLOR_BG + "; padding: 15px; border-radius: 8px; text-align: center;'>" +
                            "<div style='font-size: 13px; color: " + COLOR_TEXT_LIGHT + "; margin-bottom: 5px;'>Data do Pedido</div>" +
                            "<div style='font-weight: 600; color: " + COLOR_TEXT + ";'>" + dataPedido + "</div>" +
                            "</div>" +
                            "<div style='background-color: " + COLOR_BG + "; padding: 15px; border-radius: 8px; text-align: center;'>" +
                            "<div style='font-size: 13px; color: " + COLOR_TEXT_LIGHT + "; margin-bottom: 5px;'>Status</div>" +
                            "<div style='font-weight: 600; color: " + COLOR_SUCCESS + ";'>" + pedido.getStatus() + "</div>" +
                            "</div>" +
                            "</div>" +

                            "<h3 style='color: " + COLOR_TEXT + "; margin: 30px 0 15px 0; font-size: 18px; border-bottom: 2px solid " + COLOR_BORDER + "; padding-bottom: 8px;'>Itens do Pedido</h3>" +
                            itensHtml.toString() +

                            "<h3 style='color: " + COLOR_TEXT + "; margin: 30px 0 15px 0; font-size: 18px; border-bottom: 2px solid " + COLOR_BORDER + "; padding-bottom: 8px;'>Endereço de Entrega</h3>" +
                            "<div style='background-color: " + COLOR_BG + "; padding: 20px; border-radius: 8px; line-height: 1.6;'>" +
                            "<div style='font-weight: 600; color: " + COLOR_TEXT + "; margin-bottom: 5px;'>" + pedido.getUsuario().getNome() + "</div>" +
                            "<div style='color: " + COLOR_TEXT + ";'>" + pedido.getEnderecoDeEntrega().getRua() + ", " + pedido.getEnderecoDeEntrega().getNumero() + "</div>" +
                            "<div style='color: " + COLOR_TEXT + ";'>" + pedido.getEnderecoDeEntrega().getCidade() + " - " + pedido.getEnderecoDeEntrega().getEstado() + "</div>" +
                            "<div style='color: " + COLOR_TEXT_LIGHT + ";'>CEP: " + pedido.getEnderecoDeEntrega().getCep() + "</div>" +
                            "</div>" +

                            "<div style='text-align: center; margin: 40px 0 20px;'>" +
                            "<a href='http://localhost:5500/FRONT/perfil/HTML/pedidos.html' style='display: inline-block; background: linear-gradient(135deg, " + COLOR_PRIMARY + ", " + COLOR_PRIMARY_LIGHT + "); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 122, 0, 0.3); transition: all 0.3s ease;'>Acompanhar Pedido</a>" +
                            "</div>" +

                            "<div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid " + COLOR_BORDER + ";'>" +
                            "<p style='color: " + COLOR_TEXT_LIGHT + "; font-size: 14px; margin: 5px 0;'>Precisa de ajuda? <a href='mailto:suporte@japauniverse.com.br' style='color: " + COLOR_PRIMARY + "; text-decoration: none;'>Entre em contato conosco</a></p>" +
                            "</div>";

            String finalHtml = getBaseTemplate(bodyContent, "Confirmação de Pedido #" + pedido.getId());

            helper.setTo(pedido.getUsuario().getEmail());
            helper.setSubject("✅ Pedido Confirmado - 𝙅𝘼𝙋𝘼 𝙐𝙉𝙄𝙑𝙀𝙍𝙎𝙀 #" + pedido.getId());
            helper.setText(finalHtml, true);

            // CORREÇÃO: Tratar UnsupportedEncodingException
            try {
                helper.setFrom("nao-responda@japauniverse.com.br", "𝙅𝘼𝙋𝘼 𝙐𝙉𝙄𝙑𝙀𝙍𝙎𝙀");
            } catch (UnsupportedEncodingException e) {
                // Fallback: usar setFrom sem personalização se houver erro de encoding
                helper.setFrom("nao-responda@japauniverse.com.br");
            }

            mailSender.send(message);

        } catch (MessagingException e) {
            e.printStackTrace();
            throw new RuntimeException("Falha ao enviar e-mail de confirmação", e);
        }
    }

    @Async // ANOTAÇÃO ADICIONADA: O envio do email será executado em uma nova thread.
    public void sendPasswordResetEmail(String to, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String url = "http://127.0.0.1:5500/FRONT/login/HTML/nova-senha.html?token=" + token;

            String bodyContent =
                    "<div style='text-align: center; margin-bottom: 30px;'>" +
                            // ========== AQUI VOCÊ PODE COLOCAR UMA IMAGEM PERSONALIZADA NO CADEADO ==========
                            // Para usar imagem em vez do 🔒, substitua as 3 linhas abaixo por:
                            // "<img src='SUA_URL_DA_IMAGEM_DO_CADEADO_AQUI' alt='Redefinir Senha' style='width: 80px; height: 80px; margin-bottom: 15px;'>" +
                            "<div style='background: linear-gradient(135deg, " + COLOR_PRIMARY + ", " + COLOR_PRIMARY_LIGHT + "); width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;'>" +
                            "<span style='color: white; font-size: 24px;'>🔒</span>" +
                            "</div>" +
                            // =================================================================================
                            "<h1 style='color: " + COLOR_TEXT + "; margin: 0 0 10px 0; font-size: 28px;'>Redefinir Senha</h1>" +
                            "<p style='color: " + COLOR_TEXT_LIGHT + "; margin: 0; font-size: 16px; line-height: 1.5;'>Recebemos uma solicitação para redefinir a senha da sua conta.</p>" +
                            "</div>" +

                            "<div style='background-color: " + COLOR_BG + "; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center;'>" +
                            "<p style='color: " + COLOR_TEXT + "; margin: 0 0 15px 0;'>Clique no botão abaixo para criar uma nova senha:</p>" +
                            "<a href='" + url + "' style='display: inline-block; background: linear-gradient(135deg, " + COLOR_PRIMARY + ", " + COLOR_PRIMARY_LIGHT + "); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 122, 0, 0.3); transition: all 0.3s ease;'>Redefinir Minha Senha</a>" +
                            "</div>" +

                            "<div style='background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 15px; margin: 20px 0;'>" +
                            "<p style='color: #c53030; margin: 0; font-size: 14px; display: flex; align-items: flex-start; gap: 8px;'>" +
                            "<span style='font-size: 16px;'>⚠️</span>" +
                            "<span><strong>Importante:</strong> Se não foi você que solicitou esta redefinição, ignore este e-mail. O link expira em 1 hora.</span>" +
                            "</p>" +
                            "</div>" +

                            "<div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid " + COLOR_BORDER + ";'>" +
                            "<p style='color: " + COLOR_TEXT_LIGHT + "; font-size: 13px; margin: 5px 0;'>Caso o botão não funcione, copie e cole este link no seu navegador:</p>" +
                            "<p style='background-color: " + COLOR_BG + "; padding: 10px; border-radius: 6px; word-break: break-all; font-size: 12px; color: " + COLOR_TEXT + "; margin: 10px 0;'>" + url + "</p>" +
                            "</div>";

            String finalHtml = getBaseTemplate(bodyContent, "Redefinição de Senha");

            helper.setTo(to);
            helper.setSubject("🔐 Redefinição de Senha - 𝙅𝘼𝙋𝘼 𝙐𝙉𝙄𝙑𝙀𝙍𝙎𝙀");
            helper.setText(finalHtml, true);

            // CORREÇÃO: Tratar UnsupportedEncodingException
            try {
                helper.setFrom("japauniversestore@gmail.com", "𝙅𝘼𝙋𝘼 𝙐𝙉𝙄𝙑𝙀𝙍 S E");
            } catch (UnsupportedEncodingException e) {
                // Fallback: usar setFrom sem personalização
                helper.setFrom("japauniversestore@gmail.com");
            }

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Falha ao enviar e-mail de redefinição", e);
        }
    }

    // --- TEMPLATE BASE PROFISSIONAL ---
    private String getBaseTemplate(String content, String pageTitle) {
        return "<!DOCTYPE html>" +
                "<html lang='pt-BR'>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<title>" + pageTitle + "</title>" +
                "<style>" +
                "@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');" +
                "</style>" +
                "</head>" +
                "<body style='margin: 0; padding: 0; background-color: " + COLOR_BG + "; font-family: 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: " + COLOR_TEXT + ";'>" +
                "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='background-color: " + COLOR_BG + ";'>" +
                "<tr>" +
                "<td align='center' style='padding: 40px 20px;'>" +
                // Container Principal
                "<table role='presentation' width='100%' max-width='600' cellspacing='0' cellpadding='0' border='0' style='background-color: " + COLOR_CARD + "; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid " + COLOR_BORDER + ";'>" +

                // ========== HEADER COM IMAGEM DE CAPA ==========
                // Para usar imagem de capa, substitua TODO este bloco do header pelo código comentado abaixo:
                "" +
                "<tr>" +
                "<td style='background: linear-gradient(135deg, #000000, #1a1a1a); padding: 40px 20px; text-align: center; position: relative; overflow: hidden;'>" +
                // Efeito de brilho sutil
                "<div style='position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,122,0,0.1) 0%, transparent 70%); transform: rotate(45deg);'></div>" +
                // Logo e Nome
                "<div style='position: relative; z-index: 2;'>" +
                "<h1 style='color: " + COLOR_PRIMARY + "; margin: 0 0 8px 0; font-family: \"Bebas Neue\", sans-serif; letter-spacing: 4px; font-size: 42px; font-weight: 400; text-transform: uppercase;'>𝙅𝘼𝙋𝘼 𝙐𝙉𝙄𝙑𝙀𝙍𝙎𝙀</h1>" +
                "<p style='color: rgba(255,255,255,0.8); margin: 0; font-size: 14px; letter-spacing: 2px; font-weight: 300;'>STYLE • CULTURE • IDENTITY</p>" +
                "</div>" +
                "</td>" +
                "</tr>" +
                "" +

                "" +
                "" +
                "<img src='SUA_URL_DA_IMAGEM_DE_CAPA_AQUI' alt='𝙅𝘼𝙋𝘼 𝙐𝙉𝙄𝙑𝙀𝙍𝙎𝙀' style='width: 100%; max-width: 600px; height: 200px; object-fit: cover; display: block;'>" +
                "" +
                "<div style='background: linear-gradient(transparent, rgba(0,0,0,0.7)); padding: 20px; margin-top: -80px; position: relative;'>" +
                "<h1 style='color: white; margin: 0; font-family: \"Bebas Neue\", sans-serif; letter-spacing: 4px; font-size: 42px; font-weight: 400; text-transform: uppercase; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);'>𝙅𝘼𝙋𝘼 𝙐𝙉𝙄𝙑𝙀𝙍𝙎𝙀</h1>" +
                "<p style='color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px; letter-spacing: 2px; font-weight: 300; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);'>STYLE • CULTURE • IDENTITY</p>" +
                "</div>" +
                "</td>" +
                "</tr>" +
                "-->" +

                // Conteúdo Dinâmico
                "<tr>" +
                "<td style='padding: 40px 30px;'>" +
                content +
                "</td>" +
                "</tr>" +

                // Footer Profissional
                "<tr>" +
                "<td style='background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 25px 20px; text-align: center; border-top: 1px solid " + COLOR_BORDER + ";'>" +
                "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0'>" +
                "<tr>" +
                "<td align='center'>" +
                "<div style='margin-bottom: 15px;'>" +
                "<a href='https://www.instagram.com/japauniverse' style='display: inline-block; margin: 0 8px; color: " + COLOR_TEXT_LIGHT + "; text-decoration: none; font-size: 13px; transition: color 0.3s ease;'>Instagram</a>" +
                "<span style='color: " + COLOR_BORDER + ";'>•</span>" +
                "<a href='https://www.facebook.com/japauniverse' style='display: inline-block; margin: 0 8px; color: " + COLOR_TEXT_LIGHT + "; text-decoration: none; font-size: 13px; transition: color 0.3s ease;'>Facebook</a>" +
                "<span style='color: " + COLOR_BORDER + ";'>•</span>" +
                "<a href='mailto:contato@japauniverse.com.br' style='display: inline-block; margin: 0 8px; color: " + COLOR_TEXT_LIGHT + "; text-decoration: none; font-size: 13px; transition: color 0.3s ease;'>Contato</a>" +
                "</div>" +
                "<p style='margin: 0; font-size: 12px; color: " + COLOR_TEXT_LIGHT + ";'>" +
                "&copy; 2025 𝙅𝘼𝙋𝘼 𝙐𝙉𝙄𝙑𝙀𝙍𝙎𝙀. Todos os direitos reservados.<br>" +
                "São Carlos - SP • Brasil" +
                "</p>" +
                "</td>" +
                "</tr>" +
                "</table>" +
                "</td>" +
                "</tr>" +

                "</table>" +
                "</td>" +
                "</tr>" +
                "</table>" +
                "</body>" +
                "</html>";
    }
}