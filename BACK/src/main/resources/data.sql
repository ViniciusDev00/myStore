-- Deleta dados existentes para garantir uma inserção limpa a cada reinicialização
DELETE FROM produtos;
DELETE FROM categorias;
DELETE FROM marcas;

-- Insere as Marcas que você utiliza
-- ON CONFLICT (id) DO NOTHING: Evita erros se a marca já existir
INSERT INTO marcas (id, nome) VALUES (1, 'Nike') ON CONFLICT (id) DO NOTHING;
INSERT INTO marcas (id, nome) VALUES (2, 'Air Jordan') ON CONFLICT (id) DO NOTHING;
INSERT INTO marcas (id, nome) VALUES (3, 'Adidas') ON CONFLICT (id) DO NOTHING;
INSERT INTO marcas (id, nome) VALUES (4, 'Bape') ON CONFLICT (id) DO NOTHING;
INSERT INTO marcas (id, nome) VALUES (5, 'Asics') ON CONFLICT (id) DO NOTHING;

-- Insere as Categorias que você utiliza
INSERT INTO categorias (id, nome) VALUES (1, 'Air Max 95') ON CONFLICT (id) DO NOTHING;
INSERT INTO categorias (id, nome) VALUES (2, 'Air Max DN') ON CONFLICT (id) DO NOTHING;
INSERT INTO categorias (id, nome) VALUES (3, 'Air Max TN') ON CONFLICT (id) DO NOTHING;
INSERT INTO categorias (id, nome) VALUES (4, 'Dunk') ON CONFLICT (id) DO NOTHING;
INSERT INTO categorias (id, nome) VALUES (5, 'Jordan') ON CONFLICT (id) DO NOTHING;
INSERT INTO categorias (id, nome) VALUES (6, 'Outros') ON CONFLICT (id) DO NOTHING;

-- Insere os Produtos na tabela, associando com as marcas e categorias
-- Usei os produtos dos seus arquivos JS como base
INSERT INTO produtos (nome, descricao, preco, imagem_url, estoque, marca_id, categoria_id) VALUES
('Air Max 95 CDG "Branco"', 'Colaboração icônica com a Comme des Garçons.', 899.99, '../IMG/recentes/95cdgBranco.webp', 10, 1, 1),
('Air Max 95 CDG "Cinza/Preto"', 'Estilo e conforto em um design clássico reinventado.', 949.99, '../IMG/recentes/95cdgCinzaPreto.webp', 10, 1, 1),
('Air Max 95 CDG "Preto"', 'Visual minimalista e sofisticado da parceria com a CDG.', 899.99, '../IMG/recentes/95cdgPreto.webp', 10, 1, 1),

('Air Max DN "All Black"', 'A nova geração do Air com amortecimento dinâmico.', 1099.99, '../IMG/recentes/dnBlack.webp', 10, 1, 2),
('Air Max DN "Dark Smoke Grey"', 'Inovação e estilo com a tecnologia Dynamic Air.', 999.99, '../IMG/recentes/dnDarkSmoke.webp', 10, 1, 2),
('Air Max DN "All White"', 'Um visual clean e futurista para o dia a dia.', 1199.99, '../IMG/recentes/dnWhite.webp', 10, 1, 2),

('Air Max Plus TN "Black Silver"', 'O clássico TN com um toque metálico.', 999.99, '../IMG/recentes/tnBlackSilver.webp', 10, 1, 3),
('Air Max Plus TN "Lilac"', 'Cores vibrantes para um estilo de rua autêntico.', 1199.99, '../IMG/recentes/tnLilac.webp', 10, 1, 3),
('Air Max Plus TN "Royal Blue"', 'O azul icônico que marcou uma geração.', 1199.99, '../IMG/recentes/tnRoyal.webp', 10, 1, 3),
('Air Max Plus TN "Oreo"', 'Contraste perfeito entre preto e branco.', 1199.99, '../IMG/recentes/tnOreo.webp', 10, 1, 3),

('Dunk Low “Black/White”', 'O famoso "Panda", um ícone da cultura sneaker.', 369.00, '../IMG/recentes/p6.webp', 10, 1, 4),
('Jordan 1 Low x Travis Scott “Triple Black”', 'Colaboração desejada com o selo Cactus Jack.', 379.00, '../IMG/recentes/p11.webp', 10, 2, 5),
('Yeezy 500 “Utility Black”', 'Design robusto e conforto incomparável da linha Yeezy.', 379.00, '../IMG/recentes/p16.webp', 10, 3, 6);
