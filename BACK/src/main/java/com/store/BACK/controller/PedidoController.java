package com.store.BACK.controller;

import com.store.BACK.model.Pedido;
import com.store.BACK.model.Usuario;
import com.store.BACK.repository.PedidoRepository;
import com.store.BACK.service.PedidoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    // --- INÍCIO DAS MODIFICAÇÕES PARA O PIXGG ---
    @Autowired
    private PedidoRepository pedidoRepository;

    @Value("${pixgg.api.key}")
    private String pixApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    // --- FIM DAS MODIFICAÇÕES ---

    @PostMapping
    public ResponseEntity<Pedido> criarPedido(@RequestBody List<Map<String, Object>> cartItems, @AuthenticationPrincipal Usuario usuarioLogado) {
        try {
            Pedido novoPedido = pedidoService.criarPedido(cartItems, usuarioLogado);
            return ResponseEntity.ok(novoPedido);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // --- ENDPOINT DO PIX MODIFICADO PARA USAR PIXGG ---
    @GetMapping("/{id}/pix")
    public ResponseEntity<Map<String, String>> gerarPix(@PathVariable Long id, @AuthenticationPrincipal Usuario usuarioLogado) {
        // 1. Busca o pedido no banco de dados
        Optional<Pedido> pedidoOptional = pedidoRepository.findById(id);
        if (pedidoOptional.isEmpty() || !pedidoOptional.get().getUsuario().getId().equals(usuarioLogado.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Pedido não encontrado ou não pertence ao usuário."));
        }
        Pedido pedido = pedidoOptional.get();

        // 2. Prepara os dados para enviar para a API da PixGG
        String url = "https://api.pixgg.com/v1/createCharge";
        
        Map<String, Object> requestBody = new HashMap<>();
        // O valor precisa ser em centavos (ex: R$ 10,50 -> 1050)
        int valorEmCentavos = pedido.getValorTotal().multiply(java.math.BigDecimal.valueOf(100)).intValue();
        requestBody.put("value", valorEmCentavos);
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.set("Authorization", pixApiKey);
        headers.set("Content-Type", "application/json");

        org.springframework.http.HttpEntity<Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(requestBody, headers);

        try {
            // 3. Faz a chamada para a API da PixGG
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("charge")) {
                Map<String, Object> charge = (Map<String, Object>) responseBody.get("charge");
                Map<String, Object> brcode = (Map<String, Object>) charge.get("brcode");

                // 4. Retorna o QR Code e o Copia e Cola para o front-end
                Map<String, String> pixData = Map.of(
                        "qrCode", (String) brcode.get("qrcode_image_url"),
                        "copiaECola", (String) brcode.get("emv")
                );
                return ResponseEntity.ok(pixData);
            } else {
                 return ResponseEntity.status(500).body(Map.of("error", "Resposta inválida da API de pagamento."));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Não foi possível gerar a cobrança PIX."));
        }
    }
}