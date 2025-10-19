package com.store.BACK.service;

// ===================================================================
// =================== IMPORTS DA NOVA BIBLIOTECA ====================
import io.github.alesaudate.pix.qrcode.Payload;
import io.github.alesaudate.pix.qrcode.builder.PayloadBuilder;
// ===================================================================

import com.store.BACK.model.Pedido;
import org.springframework.stereotype.Service;

import java.math.RoundingMode;

@Service
public class PixPayloadService {

    // --- CONFIGURE SEUS DADOS AQUI ---
    private final String PIX_KEY = "seu-pix@email.com"; // !! TROCAR ISSO !!
    private final String MERCHANT_NAME = "Japa Universe"; // Nome da loja (max 25)
    private final String MERCHANT_CITY = "SUA CIDADE"; // !! TROCAR ISSO !! (max 15, sem acento)
    // ---------------------------------

    /**
     * Gera o Payload (Pix Copia e Cola) para um pedido específico.
     * @param pedido O pedido que acabou de ser salvo (precisa ter ID)
     * @return A String do Pix Copia e Cola (BRCode)
     */
    public String generatePayload(Pedido pedido) {
        try {
            // --- LÓGICA ATUALIZADA PARA A NOVA BIBLIOTECA 'pix-qrcodegen' ---

            // Converte o valor para Double, arredondando
            double valorFormatado = pedido.getValorTotal()
                    .setScale(2, RoundingMode.HALF_UP)
                    .doubleValue();

            Payload payload = new PayloadBuilder()
                    .pixKey(PIX_KEY)                // Sua chave PIX
                    .merchantName(MERCHANT_NAME)    // Nome da Loja
                    .merchantCity(MERCHANT_CITY)    // Cidade da Loja
                    .txid(String.valueOf(pedido.getId())) // ID do pedido como ID da transação
                    .amount(valorFormatado) // Valor do pedido
                    .build();

            // Retorna a string do payload (Pix Copia e Cola)
            return payload.toString();
            // --- FIM DA ATUALIZAÇÃO ---

        } catch (Exception e) {
            System.err.println("Erro grave ao gerar payload PIX para Pedido ID " + pedido.getId() + ": " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}