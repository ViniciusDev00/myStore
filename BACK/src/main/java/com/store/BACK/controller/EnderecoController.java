package com.store.BACK.controller;

import com.store.BACK.model.Endereco;
import com.store.BACK.model.Usuario;
import com.store.BACK.service.EnderecoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/enderecos")
@RequiredArgsConstructor
public class EnderecoController {

    private final EnderecoService enderecoService;

    @PostMapping
    public ResponseEntity<Endereco> adicionarEndereco(@RequestBody Endereco endereco, @AuthenticationPrincipal Usuario usuarioLogado) {
        try {
            Endereco novoEndereco = enderecoService.salvarEndereco(usuarioLogado, endereco);
            return ResponseEntity.ok(novoEndereco);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}