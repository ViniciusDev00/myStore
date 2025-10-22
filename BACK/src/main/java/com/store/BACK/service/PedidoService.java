package com.store.BACK.service;

import com.store.BACK.dto.CheckoutRequestDTO; // Importa DTO
import com.store.BACK.dto.ItemPedidoDTO;
import com.store.BACK.model.ItemPedido;
import com.store.BACK.model.Pedido;
import com.store.BACK.model.Produto;
import com.store.BACK.model.Usuario;
import com.store.BACK.model.Endereco; 
import com.store.BACK.repository.PedidoRepository;
import com.store.BACK.repository.ProdutoRepository;
import com.store.BACK.repository.EnderecoRepository; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional; // Importa Optional

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private EnderecoRepository enderecoRepository; 

    @Autowired
    private PixPayloadService pixPayloadService;

    @Transactional
    // Recebe o DTO inteiro e o usuário
    public Pedido criarPedido(CheckoutRequestDTO checkoutRequest, Usuario usuario) { 

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setDataPedido(LocalDateTime.now());
        pedido.setStatus("PENDENTE"); // Status inicial

        // 1. Busca e define o Endereço de Entrega
        Long enderecoEntregaId = checkoutRequest.getEnderecoEntregaId(); 
        Endereco endereco = enderecoRepository.findById(enderecoEntregaId)
                .orElseThrow(() -> new RuntimeException("Endereço de entrega não encontrado: " + enderecoEntregaId));
        pedido.setEnderecoDeEntrega(endereco); 

        // Define os dados do destinatário a partir do DTO
        pedido.setNomeDestinatario(checkoutRequest.getNomeDestinatario());
        pedido.setTelefoneDestinatario(checkoutRequest.getTelefoneDestinatario());
        pedido.setCpfDestinatario(checkoutRequest.getCpfDestinatario());
        pedido.setObservacoes(checkoutRequest.getObservacoes());

        List<ItemPedido> itensPedido = new ArrayList<>();
        BigDecimal valorTotal = BigDecimal.ZERO;

        List<ItemPedidoDTO> itensDTO = checkoutRequest.getItens(); 
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

        // Lógica de PIX e E-mail
        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        String pixCode = pixPayloadService.generatePayload(pedidoSalvo);

        if (pixCode != null) {
            pedidoSalvo.setPixCopiaECola(pixCode);
            pedidoSalvo = pedidoRepository.save(pedidoSalvo);
        } else {
            throw new RuntimeException("Falha crítica ao gerar o código PIX para o pedido. Pedido ID: " + pedidoSalvo.getId());
        }

        emailService.enviarConfirmacaoDePedido(usuario, pedidoSalvo);

        return pedidoSalvo;
    }

    public List<Pedido> getPedidosByUsuarioId(Long usuarioId){
        return pedidoRepository.findByUsuarioId(usuarioId);
    }

    // Este método é usado pelo PedidoController (público)
    public Pedido getPedidoById(Long id) {
        return pedidoRepository.findById(id).orElse(null);
    }

    // --- NOVO MÉTODO ADICIONADO PARA O ADMIN ---
    /**
     * Busca um pedido pelo ID usando a query customizada que traz todos os detalhes.
     * Usado pelo AdminController.
     */
    @Transactional(readOnly = true) // Apenas leitura
    public Pedido getPedidoDetailsById(Long id) {
        // Usa o novo método do repositório
        return pedidoRepository.findByIdWithDetails(id).orElse(null);
    }
    // --- FIM DO NOVO MÉTODO ---
}