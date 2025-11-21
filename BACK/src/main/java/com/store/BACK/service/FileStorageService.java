package com.store.BACK.service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;
import java.util.UUID; // Importação necessária para UUID

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

  // CORREÇÃO: Aponta para a pasta física correta
  private final Path root = Paths.get("src/main/resources/static/uploads");

  public void init() {
    try {
      Files.createDirectories(root);
    } catch (IOException e) {
      throw new RuntimeException("Could not initialize folder for upload!");
    }
  }

  public void save(MultipartFile file) {
    // Este método também precisa ser corrigido para evitar colisões
    this.saveAndGetFilename(file);
  }

  public String saveAndGetFilename(MultipartFile file) {
    try {
      String originalFilename = file.getOriginalFilename();
      String fileExtension = "";
      int dotIndex = originalFilename.lastIndexOf('.');

      // Extrai a extensão do arquivo
      if (dotIndex > 0) {
        fileExtension = originalFilename.substring(dotIndex);
      }

      // CORREÇÃO: Cria um nome único usando UUID
      String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

      Files.copy(file.getInputStream(), this.root.resolve(uniqueFilename));
      return "uploads/" + uniqueFilename; // Retorna "uploads/arquivo.jpg"
    } catch (Exception e) {
      if (e instanceof FileAlreadyExistsException) {
        // Embora improvável com UUID, mantemos a exceção
        throw new RuntimeException("A file of that name already exists.");
      }
      // Lança RuntimeException para o erro 500 do Spring
      throw new RuntimeException(e.getMessage());
    }
  }

  public Resource load(String filename) {
    try {
      Path file = root.resolve(filename);
      Resource resource = new UrlResource(file.toUri());

      if (resource.exists() || resource.isReadable()) {
        return resource;
      } else {
        throw new RuntimeException("Could not read the file!");
      }
    } catch (MalformedURLException e) {
      throw new RuntimeException("Error: " + e.getMessage());
    }
  }

  public void deleteAll() {
    // FileSystemUtils.deleteRecursively(root.toFile());
  }

  public Stream<Path> loadAll() {
    try {
      return Files.walk(this.root, 1).filter(path -> !path.equals(this.root)).map(this.root::relativize);
    } catch (IOException e) {
      throw new RuntimeException("Could not load the files!");
    }
  }

  public boolean delete(String filename) {
    try {
      Path file = root.resolve(filename);
      return Files.deleteIfExists(file);
    } catch (IOException e) {
      throw new RuntimeException("Error: " + e.getMessage());
    }
  }
}
