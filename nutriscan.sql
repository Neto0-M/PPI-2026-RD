-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 11-Set-2026 às 01:30
-- Versão do servidor: 10.4.32-MariaDB
-- versão do PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `nutriscan`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `alimentos`
--

CREATE TABLE `alimentos` (
  `id` int(11) NOT NULL,
  `nome` varchar(200) NOT NULL,
  `codigo_barras` varchar(20) DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `calorias` decimal(6,2) DEFAULT NULL,
  `carboidratos` decimal(6,2) DEFAULT NULL,
  `proteinas` decimal(6,2) DEFAULT NULL,
  `gorduras` decimal(6,2) DEFAULT NULL,
  `sodio` decimal(6,2) DEFAULT NULL,
  `acucares` decimal(6,2) DEFAULT NULL,
  `fibras` decimal(6,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `alimentos`
--

INSERT INTO `alimentos` (`id`, `nome`, `codigo_barras`, `categoria`, `calorias`, `carboidratos`, `proteinas`, `gorduras`, `sodio`, `acucares`, `fibras`) VALUES
(1, 'Tortitas de arroz y legumbres', '8480000864833', 'Tortitas de arroz', 366.00, 55.00, 25.00, 3.10, 0.68, 2.00, 7.90),
(2, 'Copos de trigo integral y arroz 0% azúcares añadidos', '8480000094889', 'Cereales para el desayuno', 373.00, 75.00, 10.33, 1.67, 0.24, 0.67, 4.67),
(3, 'Cereales rellenos de leche', '8480000092649', 'Cereales rellenos', 447.00, 67.00, 10.00, 14.50, 0.31, 37.00, 3.30),
(4, 'Barritas de trigo y arroz integral con chocolate con leche', '8480000093509', 'Barritas de cereales', 345.00, 54.00, 6.50, 9.90, 0.33, 27.00, 7.40),
(5, 'Galletas de arroz inflado rellenas de chocolate y avellana', '3245413504531', 'Postres, Galletas, Tortitas de arroz con chocolate negro, Tortitas de arroz integral', 454.00, 70.00, 5.90, 18.00, 0.08, 24.00, 2.30),
(6, 'Galettes de riz Chocolat Noir', '3560071469771', 'Galettes de riz au chocolat noir', 492.00, 60.00, 7.30, 23.00, 0.00, 22.00, 6.40),
(7, 'Tortitas de arroz', '8480000140135', 'Tortitas de arroz integral', 363.00, 75.00, 8.50, 2.80, 0.68, 1.00, 1.70),
(8, 'Bebida de Coco & Arroz', '8480000138460', 'Productos pasteurizados, Mezclas de leches vegetales', 50.00, 9.00, 0.10, 1.60, 0.03, 6.30, 0.10),
(9, 'Bebida de arroz y avellana', '8480000138484', 'Rice-based drinks, Hazelnut-based drinks, Mixed plant milks', 50.00, 6.90, 0.60, 2.10, 0.03, 3.80, 0.40),
(10, 'Sabroz arroz integral', '8410184040747', 'Arroces integrales, Arroces de grano corto, Arroces precocidos', 164.00, 31.00, 3.80, 2.20, 0.12, 0.50, 2.80),
(11, 'Feijão encarnado', '20128630', 'Céréales en grains, Sésame', 94.00, 11.00, 7.80, 0.80, 0.16, 0.20, 6.40),
(12, 'Feijão Encarnado', '5601151660751', 'Vegetais enlatados, Feijões vermelhos, en:Canned red kidney beans', 98.00, 13.00, 7.60, 0.60, 0.34, 0.40, 5.50),
(13, 'Feijão Preto', '5601151170755', 'en:Canned black beans', 92.00, 11.50, 6.30, 0.80, 0.27, 0.60, 6.80),
(14, 'Feijão encarnado • Red Beans', '5601151510759', 'Haricots rouges, Haricots rouges en conserve', 73.30, 8.30, 6.10, 0.30, 0.35, 0.30, 6.50),
(15, 'Feijão Preto', '5601151021750', 'Black beans', 75.00, 9.00, 5.80, 0.50, 0.42, 0.50, 5.50),
(16, 'Feijão branco', '20027162', 'Alimentos à base de plantas', 104.00, 15.00, 6.60, 0.80, 0.16, 0.20, 5.40),
(17, 'Feijão Manteiga', '5601151070758', 'Vegetais enlatados, Feijões comuns em lata', 88.00, 11.00, 6.50, 0.70, 0.36, 0.50, 6.00),
(18, 'Feijão Encarnado Cozido', '5601312008972', 'Feijões vermelhos', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(19, 'Feijão Preto', '5601312009030', 'en:Canned black beans', 90.00, 10.90, 6.80, 0.90, 0.10, 0.70, 7.10),
(20, 'Chili de Feijão', '5601151964132', '', 74.00, 12.60, 3.00, 1.30, 0.48, 2.90, 4.10),
(21, 'Doce Extra Fresa Morango', '20000653', 'en:fruits-based-foods, Marmeladas, Doce extra, Doces de morango', 241.00, 57.80, 0.40, 0.10, 0.00, 57.70, 1.20),
(22, 'Hipro morango', '3033492036131', 'Produits laitiers, nl:Yoghurt en plantaardig alternatief', 54.00, 3.90, 9.40, 1.00, 3.60, 3.60, 0.00),
(23, 'Doce de Morango', '5607238033807', 'Doces de morango', 52.00, 14.80, 0.40, 0.20, 0.00, 5.40, 0.00),
(24, 'Pro Sabor Morango', '8445291325067', 'Farinhas de cereais', 392.00, 62.00, 25.00, 3.00, 0.00, 10.50, 8.50),
(25, 'Fruit yogurt', '20047696', 'Low-fat yogurts, Fruit yogurts with fruit chunks, Pear yogurts, Pineapple yogurts, Raspberry yogurts', 84.00, 15.90, 3.90, 0.10, 0.07, 15.30, 3.90),
(26, 'Bio Frucht Joghurt Erdbeere', '20144319', 'Strawberry yogurts', 60.67, 12.10, 3.70, 2.80, 0.04, 11.20, 0.00),
(27, 'Iogurte Morango Sabor +Proteína', '5601312511939', 'Iogurtes líquidos', 70.50, 4.10, 7.60, 0.40, 0.02, 3.80, 0.00),
(28, 'Liberals pro morango', '3023290075432', 'Fermented milk drinks, Cow milk yogurts, pt:Iogurte', 45.80, 3.19, 7.59, 0.29, 0.04, 2.41, 0.00),
(29, 'Activia morango e kiwi 0% M.G.', '5601050033861', 'Iogurtes líquidos, en:Bifidus yogurts', 33.55, 5.03, 2.71, 0.32, 0.04, 4.90, 0.00),
(30, 'Gelatina sabor morango', '7622201735012', 'Sobremesas de gelatina', 10.00, 0.90, 1.60, 0.00, 0.04, 0.00, 0.00),
(31, 'Pechuga de Pavo Cocida 92%', '8480000057105', 'Pechuga de pavo', 89.00, 0.80, 19.60, 1.20, 0.75, 0.80, 0.00),
(32, 'Façon Chili', '3175681210981', 'Plats à base de haricots, plats préparés à réchauffer au micro-ondes, Chili sin carne, Plats préparé', 111.00, 8.90, 7.60, 3.50, 0.26, 2.30, 6.90),
(33, 'Delizias pechuga de pavo', '8410783344468', 'Pavo, Fiambre de pechuga de pavo', 79.00, 1.80, 16.00, 0.90, 0.72, 0.50, 0.00),
(34, 'Le Chili Con Carne et son riz blanc', '3302740484100', 'Viandes et dérivés, Plats à base de riz, Plats au bœuf, plats préparés à réchauffer au micro-ondes, ', 123.00, 15.00, 6.20, 3.40, 0.24, 1.20, 3.70),
(35, 'Jamón Cocido', '8480000592569', 'Meats, Cooked ham choice', 102.00, 0.90, 19.00, 2.50, 1.90, 0.90, 0.00),
(36, 'Jamón Serrano', '8421384012014', 'Meats, Serrano ham, Carnes  Embutidos  Productos a base de carne  Jamón  Jamón de país  Jamones seco', 248.00, 1.00, 33.50, 12.20, 1440.00, 0.50, 0.00),
(37, 'Jamón cocido extra finas lonchas', '8480000860743', 'Carnes, jamón cocido', 101.00, 0.90, 18.60, 2.50, 0.76, 0.90, 0.00),
(38, 'Pechuga de pavo finas lonchas', '8480000679727', 'Fiambre de pechuga de pavo', 78.00, 0.60, 17.80, 0.50, 0.74, 0.60, 0.00),
(39, 'Pechuga de Pollo 92%', '8480000086679', 'Pechugas de pollo, Fiambre de pechuga de pollo, ca:Pit-de-pollastre, ca:pit de pollastre', 89.00, 1.00, 18.10, 1.70, 0.76, 1.00, 0.00),
(40, 'Chili con carne et riz', '3270160860722', 'Viandes et dérivés, Plats à base de riz, Plats au bœuf, Plats préparés surgelés, plats préparés à ré', 120.00, 14.00, 6.30, 3.80, 0.20, 1.50, 2.90),
(41, 'Fiambre de chuleta cocida y ahumada sajonia', '8436028970636', '', 74.00, 4.00, 13.50, 0.60, 1.04, 0.50, 0.00),
(42, 'Chuleta de pavo', '8436009651288', '', 131.00, 1.90, 15.55, 6.78, 0.68, 1.69, 0.00),
(43, 'Chuleta de sajonia', '2997288003558', '', 135.00, 1.50, 17.50, 6.50, 0.88, 1.30, 0.00),
(44, 'Pavo Chuleta al ajillo', '2500214003784', '', 92.30, 0.00, 17.90, 2.30, 0.37, 0.00, 0.00),
(45, 'Chuletas de aguja', '2500246003905', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(46, 'Produto sem nome', '2323305003520', 'Chuleta sajonia', 112.00, 3.20, 11.00, 6.30, 0.76, 1.00, 0.00),
(47, 'Produto sem nome', '2225571002811', 'Chuleta de pavo', 85.00, 0.80, 16.40, 1.80, 0.36, 0.40, 1.00),
(48, 'Chuletas de cordero', '2302596008025', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(49, 'Chuleta de pavo al ajillo', '2616119003702', 'Dindes', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(50, 'Chuletas de aguja', '2913425003267', 'Carne de cerdo', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(51, 'Mini Biscoitos de Arroz Integral Camil Natural', '7896006779674', 'en:Puffed wholegrain rice cakes', 388.00, 80.00, 8.00, 2.33, 0.00, 0.00, 0.00),
(52, 'RISO SCOTTI - Arroz Basmati Natural Scotti', '8001860260315', 'en:White rices, Arrozes basmati', 351.00, 73.30, 0.80, 1.30, 0.00, 0.10, 1.30),
(53, 'Biscoitos de Arroz Integral Chia e Linhaça', '7896006716471', 'en:Gluten-free biscuits, en:Puffed wholegrain rice cakes', 380.00, 76.67, 9.00, 4.67, 0.17, 12.00, 5.00),
(54, 'Biscoito de arroz', '7896006716464', 'Biscuits', 373.33, 80.00, 7.67, 2.00, 0.00, 2.00, 5.00),
(55, 'Arroz Namorando', '7896079431158', 'Arrozes', 161.00, 30.00, 3.20, 2.80, 0.00, 0.00, 0.00),
(56, 'Biscoito de Arroz', '7896283007460', 'Biscuits', 336.67, 80.00, 6.67, 10.00, 0.00, 0.00, 5.00),
(57, 'Cereal Infantil Integral Arroz Aveia Mucilon Pacote 180g', '7891000319543', 'Cereal infantil', 376.19, 80.95, 6.67, 0.00, 0.00, 0.00, 0.00),
(58, 'Arroz Polido Tipo 1', '7896062699961', 'Arroces', 352.00, 76.00, 8.00, 1.40, 0.00, 0.00, 0.00),
(59, 'Arroz Integral', '7896006755517', 'en:Brown rices, Arrozes Parbolizados, Arrozes integrais', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(60, 'Biscoito de arroz', '7896546160017', '', 360.00, 76.67, 7.33, 2.00, 0.00, 1.67, 4.67);

-- --------------------------------------------------------

--
-- Estrutura da tabela `historico_pesquisas`
--

CREATE TABLE `historico_pesquisas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `alimento_id` int(11) NOT NULL,
  `data_pesquisa` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura stand-in para vista `ranking_global`
-- (Veja abaixo para a view atual)
--
CREATE TABLE `ranking_global` (
`alimento_id` int(11)
,`nome` varchar(200)
,`total_pesquisas` bigint(21)
,`media_calorias` decimal(6,1)
,`media_proteinas` decimal(6,1)
,`pontuacao_saudavel` decimal(9,2)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para vista `ranking_pessoal`
-- (Veja abaixo para a view atual)
--
CREATE TABLE `ranking_pessoal` (
`usuario_id` int(11)
,`alimento_id` int(11)
,`nome` varchar(200)
,`total_pesquisas` bigint(21)
,`media_calorias` decimal(6,1)
,`media_proteinas` decimal(6,1)
,`pontuacao_saudavel` decimal(9,2)
);

-- --------------------------------------------------------

--
-- Estrutura da tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para vista `ranking_global`
--
DROP TABLE IF EXISTS `ranking_global`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `ranking_global`  AS SELECT `a`.`id` AS `alimento_id`, `a`.`nome` AS `nome`, count(`h`.`id`) AS `total_pesquisas`, round(avg(`a`.`calorias`),1) AS `media_calorias`, round(avg(`a`.`proteinas`),1) AS `media_proteinas`, round(avg(`a`.`proteinas`) * 2 - avg(`a`.`calorias`) / 10,2) AS `pontuacao_saudavel` FROM (`historico_pesquisas` `h` join `alimentos` `a` on(`h`.`alimento_id` = `a`.`id`)) GROUP BY `a`.`id` HAVING `total_pesquisas` >= 2 ;

-- --------------------------------------------------------

--
-- Estrutura para vista `ranking_pessoal`
--
DROP TABLE IF EXISTS `ranking_pessoal`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `ranking_pessoal`  AS SELECT `u`.`id` AS `usuario_id`, `a`.`id` AS `alimento_id`, `a`.`nome` AS `nome`, count(`h`.`id`) AS `total_pesquisas`, round(avg(`a`.`calorias`),1) AS `media_calorias`, round(avg(`a`.`proteinas`),1) AS `media_proteinas`, round(avg(`a`.`proteinas`) * 2 - avg(`a`.`calorias`) / 10,2) AS `pontuacao_saudavel` FROM ((`historico_pesquisas` `h` join `alimentos` `a` on(`h`.`alimento_id` = `a`.`id`)) join `usuarios` `u` on(`h`.`usuario_id` = `u`.`id`)) GROUP BY `u`.`id`, `a`.`id` ;

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `alimentos`
--
ALTER TABLE `alimentos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_barras` (`codigo_barras`);

--
-- Índices para tabela `historico_pesquisas`
--
ALTER TABLE `historico_pesquisas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `alimento_id` (`alimento_id`);

--
-- Índices para tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `alimentos`
--
ALTER TABLE `alimentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT de tabela `historico_pesquisas`
--
ALTER TABLE `historico_pesquisas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `historico_pesquisas`
--
ALTER TABLE `historico_pesquisas`
  ADD CONSTRAINT `historico_pesquisas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `historico_pesquisas_ibfk_2` FOREIGN KEY (`alimento_id`) REFERENCES `alimentos` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
