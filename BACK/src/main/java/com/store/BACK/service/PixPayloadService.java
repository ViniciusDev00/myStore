package com.store.BACK.service;

// Importa a classe da nova biblioteca
import br.com.nordestefomento.jrpix.JRPix;
import com.store.BACK.model.Pedido;
import org.springframework.stereotype.Service;

import java.math.RoundingMode;

@Service
public class PixPayloadService {

    // --- CONFIGURE SEUS DADOS AQUI ---
    // Coloque sua chave PIX (CPF, CNPJ, E-mail, Celular ou Chave Aleatória)
    private final String PIX_KEY = "seu-pix@email.com"; 
    
    // O nome da sua loja (max 25 caracteres)
    private final String MERCHANT_NAME = "Japa Universe"; 
    
    // O nome da sua cidade (sem acentos, max 15 caracteres)
    private final String MERCHANT_CITY = "Sua Cidade"; 
    // ---------------------------------

    /**
     * Gera o Payload (Pix Copia e Cola) para um pedido específico.
     * @param pedido O pedido que acabou de ser salvo (precisa ter ID)
     * @return A String do Pix Copia e Cola (BRCode)
     */
    public String generatePayload(Pedido pedido) {
        try {
            // Cria uma instância do gerador da nova biblioteca
            JRPix pix = new JRPix();

            // Configura os dados
            pix.setChave(PIX_KEY);
            pix.setNome(MERCHANT_NAME);
            pix.setCidade(MERCHANT_CITY);

            // Define o ID da transação como o ID do pedido. ISSO É O MAIS IMPORTANTE!
            // Esta biblioteca já adiciona "***" automaticamente, então só passamos o ID.
            pix.setTxId(String.valueOf(pedido.getId()));
            
            // Define o valor exato do pedido. A biblioteca espera um Double.
            double valor = pedido.getValorTotal().setScale(2, RoundingMode.HALF_UP).doubleValue();
            pix.setValor(valor);

            // Retorna a string do payload
            return pix.getPayload();
            
        } catch (Exception e) {
            // Em caso de erro, loga no console e retorna null
            System.err.println("Erro grave ao gerar payload PIX para Pedido ID " + pedido.getId() + ": " + e.getMessage());
            e.printStackTrace();
            return null; 
        }
    }
}
