package com.store.BACK.service;

import com.store.BACK.model.Endereco;
import com.store.BACK.model.Usuario;
import com.store.BACK.repository.EnderecoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;

    @Transactional
    public Endereco salvarEndereco(Usuario usuario, Endereco endereco) {
        endereco.setUsuario(usuario); // Associa o endereço ao usuário logado
        return enderecoRepository.save(endereco);
    }
}