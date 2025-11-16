package com.store.BACK.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.store.BACK.model.Pedido;
import com.store.BACK.model.PedidoAviso;
import com.store.BACK.repository.PedidoAvisoRepository;
import com.store.BACK.repository.PedidoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PedidoAvisoService {

    private final PedidoAvisoRepository pedidoAvisoRepository;
    private final PedidoRepository pedidoRepository;
    private final FileStorageService fileStorageService;

    public PedidoAviso createAviso(Long pedidoId, String mensagem, MultipartFile imagem) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido not found with id: " + pedidoId));

        String imagemUrl = null;
        if (imagem != null && !imagem.isEmpty()) {
            // Usa o método corrigido que retorna um nome de arquivo único (UUID)
            imagemUrl = fileStorageService.saveAndGetFilename(imagem);
        }

        PedidoAviso aviso = new PedidoAviso(null, mensagem, imagemUrl, java.time.LocalDateTime.now(), false, pedido);

        return pedidoAvisoRepository.save(aviso);
    }

    public List<PedidoAviso> getAvisosByPedidoId(Long pedidoId) {
        return pedidoAvisoRepository.findByPedidoIdOrderByDataAvisoDesc(pedidoId);
    }

    @Transactional
    public void markAvisosAsLido(Long pedidoId) {
        List<PedidoAviso> avisos = pedidoAvisoRepository.findByPedidoIdOrderByDataAvisoDesc(pedidoId);
        avisos.forEach(aviso -> aviso.setLido(true));
        pedidoAvisoRepository.saveAll(avisos);
    }
}