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
import org.springframework.web.client.HttpClientErrorException;
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

    @Autowired
    private PedidoRepository pedidoRepository;

    @Value("${pixgg.api.key}")
    private String pixApiKey;

    private final RestTemplate restTemplate = new RestTemplate();


    @PostMapping
    public ResponseEntity<Pedido> criarPedido(@RequestBody List<Map<String, Object>> cartItems, @AuthenticationPrincipal Usuario usuarioLogado) {
        try {
            Pedido novoPedido = pedidoService.criarPedido(cartItems, usuarioLogado);
            return ResponseEntity.ok(novoPedido);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/pix")
    public ResponseEntity<Map<String, String>> gerarPix(@PathVariable Long id, @AuthenticationPrincipal Usuario usuarioLogado) {
        
        // --- INÍCIO DO CÓDIGO DE DIAGNÓSTICO ---
        System.out.println("--- INICIANDO VERIFICAÇÃO DE ACESSO AO PIX ---");
        System.out.println("ID do Pedido Solicitado: " + id);
        System.out.println("ID do Usuário Logado: " + usuarioLogado.getId());
        System.out.println("Email do Usuário Logado: " + usuarioLogado.getEmail());

        Optional<Pedido> pedidoOptional = pedidoRepository.findById(id);

        if (pedidoOptional.isEmpty()) {
            System.out.println("RESULTADO: ACESSO NEGADO. Motivo: Pedido não encontrado.");
            return ResponseEntity.status(404).body(Map.of("error", "Pedido não encontrado."));
        }

        Pedido pedido = pedidoOptional.get();
        Usuario donoDoPedido = pedido.getUsuario();

        System.out.println("ID do Dono do Pedido (do banco de dados): " + donoDoPedido.getId());
        System.out.println("Email do Dono do Pedido: " + donoDoPedido.getEmail());

        boolean isOwner = donoDoPedido.getId().equals(usuarioLogado.getId());
        System.out.println("Verificação 'É o dono?': " + isOwner);

        boolean isAdmin = usuarioLogado.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));
        System.out.println("Verificação 'É Admin?': " + isAdmin);

        if (!isOwner && !isAdmin) {
            System.out.println("RESULTADO: ACESSO NEGADO. Motivo: Usuário não é o dono e não é admin.");
            System.out.println("--- FIM DA VERIFICAÇÃO ---");
            return ResponseEntity.status(403).body(Map.of("error", "Pedido não encontrado ou acesso negado."));
        }

        System.out.println("RESULTADO: ACESSO PERMITIDO.");
        System.out.println("--- FIM DA VERIFICAÇÃO ---");
        // --- FIM DO CÓDIGO DE DIAGNÓSTICO ---
        
        String url = "https://api.pixgg.com/v1/createCharge";
        Map<String, Object> requestBody = new HashMap<>();
        int valorEmCentavos = pedido.getValorTotal().multiply(java.math.BigDecimal.valueOf(100)).intValue();
        requestBody.put("value", valorEmCentavos);
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.set("Authorization", "Bearer " + pixApiKey);
        headers.set("Content-Type", "application/json");

        org.springframework.http.HttpEntity<Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("charge")) {
                Map<String, Object> charge = (Map<String, Object>) responseBody.get("charge");
                Map<String, Object> brcode = (Map<String, Object>) charge.get("brcode");

                Map<String, String> pixData = Map.of(
                        "qrCode", (String) brcode.get("qrcode_image_url"),
                        "copiaECola", (String) brcode.get("emv")
                );
                return ResponseEntity.ok(pixData);
            } else {
                 return ResponseEntity.status(500).body(Map.of("error", "Resposta inválida da API de pagamento."));
            }
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().is4xxClientError()) {
                return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", "Erro de autorização com a API de pagamento. Verifique a API Key."));
            }
            return ResponseEntity.status(500).body(Map.of("error", "Erro ao se comunicar com a API de pagamento."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Não foi possível gerar a cobrança PIX."));
        }
    }
}