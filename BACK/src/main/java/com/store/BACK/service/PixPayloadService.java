package com.store.BACK.service;

// ===================================================================
// =================== IMPORTS DA NOVA BIBLIOTECA ====================
import br.com.mvallim.emvqrcode.EmvQrcode;
import br.com.mvallim.emvqrcode.builder.EmvQrcodeBuilder;
import br.com.mvallim.emvqrcode.constants.EmvCountryCode;
import br.com.mvallim.emvqrcode.constants.EmvCurrency;
import br.com.mvallim.emvqrcode.constants.pix.PixKeyType;
// ===================================================================

import com.store.BACK.model.Pedido;
import org.springframework.stereotype.Service;

import java.math.RoundingMode;

@Service
public class PixPayloadService {

    // --- CONFIGURE SEUS DADOS AQUI ---
    private final String PIX_KEY = "seu-pix@email.com"; // !! TROCAR ISSO !! (Chave aleatória, email, cpf, etc)
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
            // --- LÓGICA ATUALIZADA PARA A NOVA BIBLIOTECA 'emv-qrcode' ---
            
            // Converte o valor para o formato correto
            String valorFormatado = pedido.getValorTotal().setScale(2, RoundingMode.HALF_UP).toString();
            
            // Define o tipo da sua chave PIX. Mude conforme necessário.
            // Opções: CPF, CNPJ, EMAIL, PHONE, RANDOM
            PixKeyType tipoChave = PixKeyType.EMAIL; 

            EmvQrcode pix = new EmvQrcodeBuilder()
                    .setCountryCode(EmvCountryCode.BRAZIL) // País
                    .setCurrency(EmvCurrency.BRAZILIAN_REAL) // Moeda
                    .setMerchantName(MERCHANT_NAME) // Nome da Loja
                    .setMerchantCity(MERCHANT_CITY) // Cidade da Loja
                    .setAmount(valorFormatado) // Valor do pedido
                    .setTransactionId(String.valueOf(pedido.getId())) // ID do pedido
                    .setPixKey(PIX_KEY, tipoChave) // Sua chave PIX e o tipo dela
                    .build();

            // Retorna a string do payload (Pix Copia e Cola)
            return pix.toCode();
            // --- FIM DA ATUALIZAÇÃO ---

        } catch (Exception e) {
            System.err.println("Erro grave ao gerar payload PIX para Pedido ID " + pedido.getId() + ": " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}