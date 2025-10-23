package com.store.BACK.config;

import com.store.BACK.model.Usuario;
import com.store.BACK.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (usuarioRepository.findByEmail("admin@japaunder.com").isEmpty()) {
            Usuario admin = Usuario.builder() // Usando Builder para clareza
                .nome("Admin Japa")
                .email("admin@japaunder.com")
                .senha(passwordEncoder.encode("admin123"))
                // --- CORREÇÃO: Usando setRole ---
                .role("ROLE_ADMIN")
                .build();

            // Adicione CPF e Telefone se forem obrigatórios no banco
            // admin.setCpf("000.000.000-00");
            // admin.setTelefone("(00) 00000-0000");

            usuarioRepository.save(admin);
            System.out.println(">>> Usuário ADMIN criado com sucesso!");
        }
    }
}