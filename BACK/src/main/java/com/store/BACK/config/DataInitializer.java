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
        // Verifica se o usuário admin já existe no banco de dados
        if (usuarioRepository.findByEmail("admin@japaunder.com").isEmpty()) {

            // Se não existir, cria um novo usuário admin
            Usuario admin = new Usuario();
            admin.setNome("Admin Japa");
            admin.setEmail("admin@japaunder.com");
            // Codifica a senha antes de salvar
            admin.setSenha(passwordEncoder.encode("admin123"));
            admin.setRole("ROLE_ADMIN");

            usuarioRepository.save(admin);
            System.out.println(">>> Usuário ADMIN criado com sucesso!");
        }
    }
}