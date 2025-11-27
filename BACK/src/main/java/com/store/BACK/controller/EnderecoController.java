package com.store.BACK.controller;

import com.store.BACK.model.Endereco;
import com.store.BACK.model.Usuario;
import com.store.BACK.service.EnderecoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    @PostMapping
    public ResponseEntity<Endereco> adicionarEndereco(@RequestBody Endereco endereco, @AuthenticationPrincipal Usuario usuarioLogado) {
        try {
            // Validação extra para garantir que o usuário chegou
            if (usuarioLogado == null) {
                System.out.println("ERRO: Usuário logado está vindo NULO no Controller");
                return ResponseEntity.status(403).build();
            }

            Endereco novoEndereco = enderecoService.salvarEndereco(usuarioLogado, endereco);
            return ResponseEntity.ok(novoEndereco);
        } catch (Exception e) {
            // ISSO É IMPORTANTE: Mostra o erro real no terminal do Java
            System.err.println("--- ERRO AO SALVAR ENDEREÇO ---");
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}