package com.store.BACK.controller;

import com.store.BACK.model.Contato;
import com.store.BACK.model.Newsletter;
import com.store.BACK.repository.ContatoRepository;
import com.store.BACK.repository.NewsletterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private ContatoRepository contatoRepository;

    @Autowired
    private NewsletterRepository newsletterRepository;

    @PostMapping("/contato")
    public ResponseEntity<Contato> enviarContato(@RequestBody Contato contato) {
        return ResponseEntity.ok(contatoRepository.save(contato));
    }

    @PostMapping("/newsletter")
    public ResponseEntity<Newsletter> inscreverNewsletter(@RequestBody Newsletter newsletter) {
        return ResponseEntity.ok(newsletterRepository.save(newsletter));
    }
}