// Local: BACK/src/main/java/com/store/BACK/repository/UsuarioRepository.java
package com.store.BACK.repository;

import com.store.BACK.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);

    // NOVO MÉTODO
    Optional<Usuario> findByPasswordResetToken(String passwordResetToken);
}
