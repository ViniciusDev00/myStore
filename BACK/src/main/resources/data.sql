-- Inserir Marcas
INSERT INTO marcas (id, nome) VALUES (1, 'Nike'), (2, 'Air Jordan'), (3, 'Adidas'), (4, 'Bape'), (5, 'Asics');

-- Inserir Categorias
INSERT INTO categorias (id, nome) VALUES (1, 'Air Max 95'), (2, 'Air Max DN'), (3, 'Air Max TN'), (4, 'Dunk'), (5, 'Jordan'), (6, 'Outros');

-- Inserir Produtos
INSERT INTO produtos (id, nome, descricao, preco, imagem_url, estoque, marca_id, categoria_id) VALUES
(1, 'Air Max 95 CDG "Branco"', 'Colaboração icônica com a Comme des Garçons.', 899.99, '../../inicio/IMG/recentes/95cdgBranco.webp', 10, 1, 1),
(2, 'Air Max 95 CDG "Cinza/Preto"', 'Estilo e conforto em um design clássico reinventado.', 949.99, '../../inicio/IMG/recentes/95cdgCinzaPreto.webp', 10, 1, 1),
(3, 'Air Max 95 CDG "Preto"', 'Visual minimalista e sofisticado da parceria com a CDG.', 899.99, '../../inicio/IMG/recentes/95cdgPreto.webp', 10, 1, 1),
(4, 'Air Max DN "All Black"', 'A nova geração do Air com amortecimento dinâmico.', 1099.99, '../../inicio/IMG/recentes/dnBlack.webp', 10, 1, 2),
(5, 'Air Max DN "Dark Smoke Grey"', 'Inovação e estilo com a tecnologia Dynamic Air.', 999.99, '../../inicio/IMG/recentes/dnDarkSmoke.webp', 10, 1, 2),
(6, 'Air Max DN "All White"', 'Um visual clean e futurista para o dia a dia.', 1199.99, '../../inicio/IMG/recentes/dnWhite.webp', 10, 1, 2),
(7, 'Air Max Plus TN "Black Silver"', 'O clássico TN com um toque metálico.', 999.99, '../../inicio/IMG/recentes/tnBlackSilver.webp', 10, 1, 3),
(8, 'Air Max Plus TN "Lilac"', 'Cores vibrantes para um estilo de rua autêntico.', 1199.99, '../../inicio/IMG/recentes/tnLilac.webp', 10, 1, 3),
(9, 'Air Max Plus TN "Royal Blue"', 'O azul icônico que marcou uma geração.', 1199.99, '../../inicio/IMG/recentes/tnRoyal.webp', 10, 1, 3),
(10, 'Air Max Plus TN "Oreo"', 'Contraste perfeito entre preto e branco.', 1199.99, '../../inicio/IMG/recentes/tnOreo.webp', 10, 1, 3);