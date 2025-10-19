package com.store.BACK.service;

// ===================================================================
// =================== IMPORTS DA NOVA BIBLIOTECA ====================
import io.github.alesaudate.pix.qrcode.Payload;
import io.github.alesaudate.pix.qrcode.builder.PayloadBuilder;
// ===================================================================

import com.store.BACK.model.Pedido;
import org.springframework.stereotype.Service;

import java.math.BigDecimal; // Importe BigDecimal
import java.math.RoundingMode;

@Service
public class PixPayloadService {

    // --- CONFIGURE SEUS DADOS AQUI ---
    private final String PIX_KEY = "seu-pix@email.com"; // !! TROCAR ISSO !!
    private final String MERCHANT_NAME = "Japa Universe";
    private final String MERCHANT_CITY = "Sua Cidade"; // !! TROCAR ISSO !! Sem acentos, max 15 chars
    // ---------------------------------

    /**
     * Gera o Payload (Pix Copia e Cola) para um pedido específico usando pix-qrcodegen.
     * @param pedido O pedido que acabou de ser salvo (precisa ter ID)
     * @return A String do Pix Copia e Cola (BRCode)
     */
    public String generatePayload(Pedido pedido) {
        try {
            // --- LÓGICA ATUALIZADA PARA A NOVA BIBLIOTECA ---
            Payload payload = new PayloadBuilder()
                    .pixKey(PIX_KEY)                // Chave PIX
                    .merchantName(MERCHANT_NAME)    // Nome do recebedor (loja)
                    .merchantCity(MERCHANT_CITY)    // Cidade do recebedor
                    .txid(String.valueOf(pedido.getId())) // ID único da transação (ID do pedido)
                    .amount(pedido.getValorTotal().setScale(2, RoundingMode.HALF_UP).doubleValue()) // Valor do pedido
                    // .description("Descrição opcional") // Você pode adicionar uma descrição se quiser
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