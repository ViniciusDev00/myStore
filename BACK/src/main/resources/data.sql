-- Apagar dados existentes para garantir um estado limpo (exceto usuários)
DELETE FROM produtos;
DELETE FROM categorias;
DELETE FROM marcas;

-- Inserir Marcas
INSERT INTO marcas (id, nome) VALUES (1, 'Nike'), (2, 'Air Jordan'), (3, 'Adidas'), (4, 'Bape'), (5, 'Asics') ON DUPLICATE KEY UPDATE nome=nome;

-- Inserir Categorias
INSERT INTO categorias (id, nome) VALUES (1, 'Air Max 95'), (2, 'Air Max DN'), (3, 'Air Max TN'), (4, 'Dunk'), (5, 'Jordan'), (6, 'Outros') ON DUPLICATE KEY UPDATE nome=nome;

-- Inserir Produtos com caminhos de imagem CORRIGIDOS para o servidor
INSERT INTO produtos (id, nome, descricao, preco, preco_original, imagem_url, estoque, marca_id, categoria_id) VALUES
(1, 'Air Max 95 CDG "Branco"', 'Colaboração icônica com a Comme des Garçons, reinventando o clássico Air Max 95 com um design desconstrutído e materiais premium para um visual arrojado e sofisticado.', 899.99, 1199.99, '/inicio/IMG/recentes/95cdgBranco.webp', 10, 1, 1),
(2, 'Air Max 95 CDG "Cinza/Preto"', 'Estilo e conforto em um design clássico reinventado pela Comme des Garçons. A paleta de cores neutras destaca a construção única e os detalhes exclusivos da colaboração.', 949.99, 1249.99, '/inicio/IMG/recentes/95cdgCinzaPreto.webp', 10, 1, 1),
(3, 'Air Max 95 CDG "Preto"', 'Visual minimalista e sofisticado da parceria com a CDG. O cabedal em camadas e a sola robusta garantem um look de vanguarda e conforto duradouro.', 899.99, 1199.99, '/inicio/IMG/recentes/95cdgPreto.webp', 10, 1, 1),
(4, 'Air Max DN "All Black"', 'A nova geração do Air com amortecimento dinâmico. O sistema Dynamic Air com quatro tubos de ar proporciona uma sensação de propulsão a cada passo, num design totalmente preto.', 1099.99, 1399.99, '/inicio/IMG/recentes/dnBlack.webp', 10, 1, 2),
(5, 'Air Max DN "Dark Smoke Grey"', 'Inovação e estilo com a tecnologia Dynamic Air. A combinação de cinza escuro com detalhes vibrantes cria um visual futurista e versátil para o uso diário.', 999.99, 1299.99, '/inicio/IMG/recentes/dnDarkSmoke.webp', 10, 1, 2),
(6, 'Air Max DN "All White"', 'Um visual clean e futurista para o dia a dia. A tecnologia Dynamic Air oferece conforto incomparável, enquanto o design monocromático branco garante máxima versatilidade.', 1199.99, 1499.99, '/inicio/IMG/recentes/dnWhite.webp', 10, 1, 2),
(7, 'Air Max Plus TN "Black Silver"', 'O clássico TN com um toque metálico. As sobreposições onduladas em prata destacam-se sobre a base preta, mantendo a atitude arrojada do modelo original.', 999.99, 1299.99, '/inicio/IMG/recentes/tnBlackSilver.webp', 10, 1, 3),
(8, 'Air Max Plus TN "Lilac"', 'Cores vibrantes para um estilo de rua autêntico. O gradiente lilás no cabedal traz uma energia renovada a este ícone, combinado com o amortecimento Tuned Air para conforto superior.', 1199.99, 1499.99, '/inicio/IMG/recentes/tnLilac.webp', 10, 1, 3),
(9, 'Air Max Plus TN "Royal Blue"', 'O azul icônico que marcou uma geração. O gradiente vibrante e as linhas de design inspiradas na natureza fazem deste um dos modelos mais reconhecíveis e amados de todos os tempos.', 1199.99, 1499.99, '/inicio/IMG/recentes/tnRoyal.webp', 10, 1, 3),
(10, 'Air Max Plus TN "Oreo"', 'Contraste perfeito entre preto e branco. Este esquema de cores clássico realça o design agressivo do TN, oferecendo um visual que é ao mesmo tempo atemporal e moderno.', 1199.99, 1399.99, '/inicio/IMG/recentes/tnOreo.webp', 10, 1, 3);
