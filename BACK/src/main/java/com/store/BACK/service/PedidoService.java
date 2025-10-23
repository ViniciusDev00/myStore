package com.store.BACK.service;

import com.store.BACK.dto.ItemPedidoDTO;
import com.store.BACK.model.ItemPedido;
import com.store.BACK.model.Pedido;
import com.store.BACK.model.Produto;
import com.store.BACK.model.Usuario;
import com.store.BACK.model.Endereco; // NOVO: Importa Endereco
import com.store.BACK.repository.PedidoRepository;
import com.store.BACK.repository.ProdutoRepository;
import com.store.BACK.repository.EnderecoRepository; // NOVO: Importa EnderecoRepository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ProdutoRepository produtoRepository;
    
    @Autowired
    private EmailService emailService;

    // NOVO: Adiciona EnderecoRepository
    @Autowired
    private EnderecoRepository enderecoRepository; 
    // ---------------------------------

    // --- NOVA INJEÇÃO DE DEPENDÊNCIA ---
    @Autowired
    private PixPayloadService pixPayloadService;
    // ---------------------------------

    @Transactional
    // MODIFICADO: Recebe itensDTO, usuario E enderecoEntregaId
    public Pedido criarPedido(List<ItemPedidoDTO> itensDTO, Usuario usuario, Long enderecoEntregaId) { 
        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setDataPedido(LocalDateTime.now());
        pedido.setStatus("PENDENTE"); // Status inicial

        // NOVO: 1. Busca e define o Endereço de Entrega
        Endereco endereco = enderecoRepository.findById(enderecoEntregaId)
                .orElseThrow(() -> new RuntimeException("Endereço de entrega não encontrado: " + enderecoEntregaId));
        pedido.setEnderecoDeEntrega(endereco); 
        // FIM NOVO

        List<ItemPedido> itensPedido = new ArrayList<>();
        BigDecimal valorTotal = BigDecimal.ZERO;

        for (ItemPedidoDTO itemDTO : itensDTO) {
            Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemDTO.getProdutoId()));

            // AQUI: Adicionar validação de estoque se necessário

            ItemPedido itemPedido = new ItemPedido();
            itemPedido.setPedido(pedido);
            itemPedido.setProduto(produto);
            itemPedido.setQuantidade(itemDTO.getQuantidade());
            itemPedido.setTamanho(itemDTO.getTamanho());
            itemPedido.setPrecoUnitario(produto.getPreco());

            itensPedido.add(itemPedido);
            valorTotal = valorTotal.add(produto.getPreco().multiply(BigDecimal.valueOf(itemDTO.getQuantidade())));
        }

        pedido.setItens(itensPedido);
        pedido.setValorTotal(valorTotal);
        
        // --- 1. SALVA O PEDIDO PRIMEIRO (PARA OBTER O ID) ---
        Pedido pedidoSalvo = pedidoRepository.save(pedido);
        
        // --- 2. GERA O CÓDIGO PIX USANDO O ID DO PEDIDO SALVO ---
        String pixCode = pixPayloadService.generatePayload(pedidoSalvo);
        
        if (pixCode != null) {
            // Se o código foi gerado, salva no pedido
            pedidoSalvo.setPixCopiaECola(pixCode);
            // --- 3. SALVA O PEDIDO NOVAMENTE, AGORA COM O CÓDIGO PIX ---
            pedidoSalvo = pedidoRepository.save(pedidoSalvo);
        } else {
            // Se falhar a geração do Pix, lança um erro para cancelar a transação
            // Isso impede que um pedido seja criado sem um código de pagamento
            throw new RuntimeException("Falha crítica ao gerar o código PIX para o pedido. Pedido ID: " + pedidoSalvo.getId());
        }

        // --- 4. ENVIA O E-MAIL (AGORA COM O PEDIDO JÁ COMPLETO) ---
        // Você pode (opcionalmente) modificar seu EmailService para incluir o pixCode no e-mail
        emailService.enviarConfirmacaoDePedido(usuario, pedidoSalvo);

        return pedidoSalvo;
    }
    
    public List<Pedido> getPedidosByUsuarioId(Long usuarioId){
        return pedidoRepository.findByUsuarioId(usuarioId);
    }

    public Pedido getPedidoById(Long id) {
        return pedidoRepository.findById(id).orElse(null);
    }
}