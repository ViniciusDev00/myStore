package com.store.BACK.service;

import com.store.BACK.model.Pedido;
import org.springframework.stereotype.Service;

import java.math.RoundingMode;

@Service
public class PixPayloadService {

    // --- CONFIGURE SEUS DADOS AQUI ---
    private final String PIX_KEY = "japauniversestore@gmail.com"; // !! TROCAR ISSO !! (Chave aleatória, email, cpf, etc)
    private final String MERCHANT_NAME = "Japa Universe"; // Nome da loja (max 25)
    private final String MERCHANT_CITY = "SAO CARLOS"; // !! TROCAR ISSO !! (max 15, sem acento)
    // ---------------------------------

    /**
     * Gera o Payload (Pix Copia e Cola) para um pedido específico.
     * @param pedido O pedido que acabou de ser salvo (precisa ter ID)
     * @return A String do Pix Copia e Cola (BRCode)
     */
    public String generatePayload(Pedido pedido) {
        try {
            String valorFormatado = pedido.getValorTotal().setScale(2, RoundingMode.HALF_UP).toString();
            String txId = String.valueOf(pedido.getId());

            // Garante que o TXID tenha pelo menos 1 caractere, se não, usa "***"
            String txIdLimpo = (txId == null || txId.isEmpty()) ? "***" : txId.replaceAll("[^a-zA-Z0-9]", "");

            // Limita o nome e cidade aos tamanhos máximos do PIX
            String nomeLimitado = (MERCHANT_NAME.length() > 25) ? MERCHANT_NAME.substring(0, 25) : MERCHANT_NAME;
            String cidadeLimitada = (MERCHANT_CITY.length() > 15) ? MERCHANT_CITY.substring(0, 15) : MERCHANT_CITY;

            // Formata os campos do PIX (ID + Tamanho + Valor)
            String payloadFormat = formatField("00", "01");
            String merchantAccount = formatField("00", "br.gov.bcb.pix") + formatField("01", PIX_KEY);
            String merchantAccountInfo = formatField("26", merchantAccount);
            String merchantCategory = formatField("52", "0000");
            String transactionCurrency = formatField("53", "986");
            String transactionAmount = formatField("54", valorFormatado);
            String countryCode = formatField("58", "BR");
            String merchantName = formatField("59", nomeLimitado);
            String merchantCity = formatField("60", cidadeLimitada);
            String additionalData = formatField("05", txIdLimpo);
            String additionalDataField = formatField("62", additionalData);
            String crcId = "6304"; // ID e tamanho do CRC

            // Constrói o payload para calcular o CRC
            String payloadToCRC = payloadFormat +
                    merchantAccountInfo +
                    merchantCategory +
                    transactionCurrency +
                    transactionAmount +
                    countryCode +
                    merchantName +
                    merchantCity +
                    additionalDataField +
                    crcId;

            // Calcula o CRC16 e o anexa ao payload
            String crc = calculateCRC16(payloadToCRC);
            return payloadToCRC + crc;

        } catch (Exception e) {
            System.err.println("Erro grave ao gerar payload PIX para Pedido ID " + pedido.getId() + ": " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Formata um campo PIX no formato ID-TAMANHO-VALOR.
     */
    private String formatField(String id, String value) {
        String size = String.format("%02d", value.length());
        return id + size + value;
    }

    /**
     * Calcula o checksum CRC16-CCITT (Kermit) para o payload PIX.
     * Este código é padrão e não requer bibliotecas.
     */
    private static String calculateCRC16(String data) {
        int crc = 0xFFFF; // Valor inicial
        int polynomial = 0x1021; // Polinômio

        byte[] bytes = data.getBytes();

        for (byte b : bytes) {
            for (int i = 0; i < 8; i++) {
                boolean bit = ((b >> (7 - i) & 1) == 1);
                boolean c15 = ((crc >> 15 & 1) == 1);
                crc <<= 1;
                if (c15 ^ bit) crc ^= polynomial;
            }
        }
        crc &= 0xFFFF; // Garante que é 16 bits
        return String.format("%04X", crc).toUpperCase(); // Retorna como Hex de 4 dígitos
    }
}