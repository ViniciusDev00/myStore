package com.store.BACK.service;

import com.dev.jpestana.challenges.pix.payloadgenerator.classes.PixPayloadGenerator;
import com.dev.jpestana.challenges.pix.payloadgenerator.interfaces.PayloadGenerator;
import com.store.BACK.model.Pedido;
import org.springframework.stereotype.Service;

import java.math.RoundingMode;

@Service
public class PixPayloadService {

    // --- CONFIGURE SEUS DADOS AQUI ---
    // Coloque sua chave PIX (CPF, CNPJ, E-mail, Celular ou Chave Aleatória)
    private final String PIX_KEY = "japauniverse@gmail.com"; 
    
    // O nome da sua loja (max 25 caracteres)
    private final String MERCHANT_NAME = "Japa Universe Store"; 
    
    // O nome da sua cidade (sem acentos, max 15 caracteres)
    private final String MERCHANT_CITY = "SAO CARLOS"; 
    // ---------------------------------

    /**
     * Gera o Payload (Pix Copia e Cola) para um pedido específico.
     * @param pedido O pedido que acabou de ser salvo (precisa ter ID)
     * @return A String do Pix Copia e Cola (BRCode)
     */
    public String generatePayload(Pedido pedido) {
        try {
            PayloadGenerator payloadGenerator = PixPayloadGenerator.create()
                    .setPixKey(PIX_KEY)
                    .setMerchantName(MERCHANT_NAME)
                    .setMerchantCity(MERCHANT_CITY)
                    
                    // Define o ID da transação como o ID do pedido. ISSO É O MAIS IMPORTANTE!
                    // Usamos "JAPA-" como prefixo para garantir que seja único (TXID)
                    .setTxId("JAPA-" + pedido.getId().toString())
                    
                    // Define o valor exato do pedido
                    .setAmount(pedido.getValorTotal().setScale(2, RoundingMode.HALF_UP));

            // Retorna a string do payload
            return payloadGenerator.getPayload();
            
        } catch (Exception e) {
            // Em caso de erro, loga no console e retorna null
            // Em produção, você deveria usar um sistema de log melhor (ex: SLF4J)
            System.err.println("Erro grave ao gerar payload PIX para Pedido ID " + pedido.getId() + ": " + e.getMessage());
            e.printStackTrace(); // Mostra o stack trace do erro
            return null; // Retorna null para que o PedidoService possa tratar
        }
    }
}