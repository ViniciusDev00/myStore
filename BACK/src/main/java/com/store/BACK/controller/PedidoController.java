package com.store.BACK.controller;

import com.store.BACK.model.Pedido;
import com.store.BACK.model.Usuario;
import com.store.BACK.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<Pedido> criarPedido(@RequestBody List<Map<String, Object>> cartItems, @AuthenticationPrincipal Usuario usuarioLogado) {
        try {
            Pedido novoPedido = pedidoService.criarPedido(cartItems, usuarioLogado);
            return ResponseEntity.ok(novoPedido);
        } catch (Exception e) {
            // Log do erro seria útil aqui
            return ResponseEntity.badRequest().build();
        }
    }

    // --- NOVO ENDPOINT ADICIONADO ---
    @GetMapping("/{id}/pix")
    public ResponseEntity<Map<String, String>> gerarPix(@PathVariable Long id) {
        // Simulação de chamada a um Provedor de Pagamento
        String qrCodeExemplo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARgAAAGEAQMAAAB52Qy8AAAABlBMVEX///8AAABVwtN+AAABOklEQVRYhe3WMQ6DMAxFwcb8/5+mjS2oIpLgCr0D5lIVq52nJqa09gMCAgICAgICAv+rA1+30y/2CgQEBAQEBAQE/kMF9vN3+wUCEBAQEBAQEBD41woM/n5/lYCAgEBAQEBAQOADBRr8fX4VAQEBgYCAgEBA4AMFGvx9fhUBAQGBgICAQECAmIMZzR5c4fH6VQICAgIBgYCAgMDCBRqcn68gICAgEBAQEBAQeAowOP9+lYCAgEBAQEBAQOA/UmBw/v0qAgICAYGAgEBA4H8UmJy/Q0BAQCAgEBAQEHj4hA0fub+/QEBAQCAgEBAQEDhwgcH5/SoCAgIBAQEBAQGB/xdo8PX5VQICAgIBAQEBAQG/pkBwfv0KAgICAYGAgEBA4IUK7J+vUxAQEAgICAgICAh8sQJj/n5/l4CAgEBAQPDfARpS7y99f5v6AAAAAElFTkSuQmCC"; // QR Code de exemplo
        String copiaEColaExemplo = "00020126330014br.gov.bcb.pix01111234567890102120000000000003039865802BR5913NOME DO VENDEDOR6008BRASILIA62070503***6304E7C4";

        Map<String, String> pixData = Map.of(
                "qrCode", qrCodeExemplo,
                "copiaECola", copiaEColaExemplo
        );
        return ResponseEntity.ok(pixData);
    }
}