-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 11/09/2026 às 19:00
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

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
-- Estrutura para tabela `alimentos`
--

CREATE TABLE `alimentos` (
  `id` int(10) UNSIGNED NOT NULL,
  `nome` varchar(500) NOT NULL,
  `codigo_barras` varchar(50) NOT NULL DEFAULT '',
  `categoria` varchar(255) DEFAULT NULL,
  `calorias` decimal(8,2) DEFAULT NULL,
  `carboidratos` decimal(8,2) DEFAULT NULL,
  `proteinas` decimal(8,2) DEFAULT NULL,
  `gorduras` decimal(8,2) DEFAULT NULL,
  `sodio` decimal(8,2) DEFAULT NULL,
  `acucares` decimal(8,2) DEFAULT NULL,
  `fibras` decimal(8,2) DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Despejando dados para a tabela `alimentos`
--

INSERT INTO `alimentos` (`id`, `nome`, `codigo_barras`, `categoria`, `calorias`, `carboidratos`, `proteinas`, `gorduras`, `sodio`, `acucares`, `fibras`, `criado_em`, `atualizado_em`) VALUES
(1, 'LEITE PO NINHO INTEGRAL', '7891000325858', 'en:Whole milk powder', 496.00, 37.60, 25.20, 26.80, 0.39, 37.60, 0.00, '2026-09-11 13:15:07', '2026-09-11 13:15:07'),
(2, 'Leite Integral Piracanjuba', '7898215151708', 'Leites UHT, Leites integrais', 58.00, 4.60, 3.10, 3.00, 0.06, 4.60, 0.00, '2026-09-11 13:15:07', '2026-09-11 13:15:07'),
(3, 'Kit Kat', '7891000248768', 'en:Chocolate confectioneries filled with wafer', 527.71, 57.00, 7.80, 30.00, 0.09, 47.00, 2.20, '2026-09-11 13:15:07', '2026-09-11 13:15:07'),
(4, 'Leite UHT Integral', '7898080640611', 'Leites UHT, en:Whole pasteurised milks', 59.00, 4.80, 3.10, 3.00, 0.06, 4.80, 0.00, '2026-09-11 13:15:07', '2026-09-11 13:15:07'),
(5, 'Creme de Leite Piracanjuba', '7898215151784', 'Leites UHT, Cremes UHT, Leites integrais', 182.00, 4.30, 2.90, 17.00, 0.08, 4.30, 0.00, '2026-09-11 13:15:07', '2026-09-11 13:15:07'),
(6, 'leite condensado Piracanjuba', '7898215152002', 'Leites condensados', 305.00, 55.00, 8.00, 6.00, 0.13, 55.00, 0.00, '2026-09-11 13:15:07', '2026-09-11 13:15:07'),
(7, 'Leite Condensado', '7898080640413', 'Leites condensados', 305.00, 55.00, 7.50, 6.00, 0.13, 55.00, 0.00, '2026-09-11 13:15:07', '2026-09-11 13:15:07'),
(8, 'Pão de forma integral (36% Cereais integrais)', '7891962051345', 'Pães de forma integral', 269.00, 49.00, 8.70, 4.20, 0.40, 12.00, 4.00, '2026-09-11 13:15:07', '2026-09-11 13:15:07'),
(9, 'Leite em pó integral instantâneo Ninho', '7891000393284', 'Leites, en:Milk powders, leite em pó', 496.00, 37.60, 25.20, 26.80, 0.40, 36.00, 0.00, '2026-09-11 13:15:07', '2026-09-11 13:15:07'),
(10, 'Creme de Leite UHT Italac', '7898080640222', 'fr:Crèmes légères, creme de leite', 173.33, 4.67, 3.33, 15.33, 0.07, 4.67, 0.00, '2026-09-11 13:15:07', '2026-09-11 13:15:07'),
(11, 'Mini Biscoitos de Arroz Integral Camil Natural', '7896006779674', 'en:Puffed wholegrain rice cakes', 388.00, 80.00, 8.00, 2.33, 0.21, 0.00, 2.67, '2026-09-11 13:15:17', '2026-09-11 13:15:17'),
(12, 'RISO SCOTTI - Arroz Basmati Natural Scotti', '8001860260315', 'en:White rices, Arrozes basmati', 351.00, 73.30, 0.80, 1.30, 0.00, 0.10, 1.30, '2026-09-11 13:15:17', '2026-09-11 13:15:17'),
(13, 'Biscoitos de Arroz Integral Chia e Linhaça', '7896006716471', 'en:Gluten-free biscuits, en:Puffed wholegrain rice cakes', 380.00, 76.67, 9.00, 4.67, 0.17, 12.00, 5.00, '2026-09-11 13:15:17', '2026-09-11 13:15:17'),
(14, 'Biscoito de arroz', '7896006716464', 'Biscuits', 373.33, 80.00, 7.67, 2.00, NULL, 2.00, 5.00, '2026-09-11 13:15:17', '2026-09-11 13:15:17'),
(15, 'Arroz Namorando', '7896079431158', 'Arrozes', 161.00, 30.00, 3.20, 2.80, NULL, NULL, NULL, '2026-09-11 13:15:17', '2026-09-11 13:15:17'),
(16, 'Biscoito de Arroz', '7896283007460', 'Biscuits', 336.67, 80.00, 6.67, 10.00, NULL, NULL, 5.00, '2026-09-11 13:15:17', '2026-09-11 13:15:17'),
(17, 'Cereal Infantil Integral Arroz Aveia Mucilon Pacote 180g', '7891000319543', 'Cereal infantil', 376.19, 80.95, 6.67, 0.00, NULL, NULL, NULL, '2026-09-11 13:15:17', '2026-09-11 13:15:17'),
(18, 'Arroz Polido Tipo 1', '7896062699961', 'Arroces', 352.00, 76.00, 8.00, 1.40, 0.00, 0.00, 0.00, '2026-09-11 13:15:17', '2026-09-11 13:15:17'),
(19, 'Arroz Integral', '7896006755517', 'en:Brown rices, Arrozes Parbolizados, Arrozes integrais', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-11 13:15:17', '2026-09-11 13:15:17'),
(20, 'Biscoito de arroz', '7896546160017', NULL, 360.00, 76.67, 7.33, 2.00, NULL, 1.67, 4.67, '2026-09-11 13:15:17', '2026-09-11 13:15:17'),
(21, 'Feijão Carioca Tipo 1 Pantera Premium Pacote 1kg', '7896070800014', 'Feijões comuns, grãos-de-cereias', 205.00, 28.33, 18.33, 0.00, 0.01, 0.00, 41.67, '2026-09-11 13:41:36', '2026-09-11 13:41:36'),
(22, 'Feijão carioca kicaldo', '7896116900029', 'Alimentos à base de frutas e legumes, Feijões comuns', 71.00, 15.00, 4.80, 0.50, 0.00, 0.70, 7.00, '2026-09-11 13:41:36', '2026-09-11 13:41:36'),
(23, 'Feijão Preto', '7898007290202', NULL, 243.33, 36.67, 21.67, 1.17, NULL, 1.00, 21.67, '2026-09-11 13:41:36', '2026-09-11 13:41:36'),
(24, 'Feijão Preto', '7890300155929', 'Alimentos à base de vegetais, Feijões comuns, Alimentos enlatados, Leguminosas e seus produtos', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-11 13:41:36', '2026-09-11 13:41:36'),
(25, 'Feijão preto', '7896200115360', 'Feijões comuns, Feijões', 198.33, 30.00, 15.50, 2.00, 0.00, 0.00, 35.00, '2026-09-11 13:41:36', '2026-09-11 13:41:36'),
(26, 'Feijão Carioca Tipo 1 (cálcio 62mg, ferro 4mg)', '7896099100256', NULL, 261.67, 65.00, 18.72, 0.00, 0.00, NULL, 21.67, '2026-09-11 13:41:36', '2026-09-11 13:41:36'),
(27, 'Feijão carioca comum tipo 1', '7896200115346', 'Pulsos, Grãos de cereais', 178.33, 25.00, 18.33, 0.00, 38.95, NULL, 40.00, '2026-09-11 13:41:36', '2026-09-11 13:41:36'),
(28, 'Feijão Carioca', '7896062602008', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-11 13:41:36', '2026-09-11 13:41:36'),
(29, 'Feijão Caldo Nobre - Feijão Tradicional', '7898276600108', 'Feijão', 261.67, 48.33, 18.87, 0.00, 0.00, 0.00, 21.67, '2026-09-11 13:41:36', '2026-09-11 13:41:36'),
(30, 'Feijão Preto S. Máximo Tipo 1 1kg', '7896401100097', 'Feijões comuns', 266.67, 40.00, 20.00, 1.67, 0.00, 0.00, 20.00, '2026-09-11 13:41:36', '2026-09-11 13:41:36');

-- --------------------------------------------------------

--
-- Estrutura para tabela `historico_pesquisas`
--

CREATE TABLE `historico_pesquisas` (
  `id` int(10) UNSIGNED NOT NULL,
  `usuario_id` int(10) UNSIGNED NOT NULL,
  `alimento_id` int(10) UNSIGNED NOT NULL,
  `data_pesquisa` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `historico_pesquisas`
--

INSERT INTO `historico_pesquisas` (`id`, `usuario_id`, `alimento_id`, `data_pesquisa`) VALUES
(11, 1, 4, '2026-09-11 13:25:43'),
(12, 1, 2, '2026-09-11 13:25:43'),
(13, 1, 1, '2026-09-11 13:25:43'),
(14, 1, 10, '2026-09-11 13:25:43'),
(15, 1, 6, '2026-09-11 13:25:43'),
(16, 1, 9, '2026-09-11 13:25:43'),
(17, 1, 5, '2026-09-11 13:25:43'),
(18, 1, 7, '2026-09-11 13:25:43'),
(19, 1, 7, '2026-09-11 13:25:45'),
(20, 1, 4, '2026-09-11 13:25:45'),
(21, 1, 5, '2026-09-11 13:25:45'),
(22, 1, 6, '2026-09-11 13:25:45'),
(23, 1, 1, '2026-09-11 13:25:45'),
(24, 1, 2, '2026-09-11 13:25:45'),
(25, 1, 10, '2026-09-11 13:25:45'),
(26, 1, 9, '2026-09-11 13:25:45'),
(27, 1, 8, '2026-09-11 13:28:38'),
(28, 1, 8, '2026-09-11 13:28:39'),
(29, 1, 21, '2026-09-11 13:41:39'),
(30, 1, 25, '2026-09-11 13:41:39'),
(31, 1, 27, '2026-09-11 13:41:39'),
(32, 1, 28, '2026-09-11 13:41:39'),
(33, 1, 30, '2026-09-11 13:41:39'),
(34, 1, 26, '2026-09-11 13:41:39'),
(35, 1, 29, '2026-09-11 13:41:39'),
(36, 1, 24, '2026-09-11 13:41:39'),
(37, 1, 23, '2026-09-11 13:41:39'),
(38, 1, 22, '2026-09-11 13:41:39'),
(39, 1, 2, '2026-09-11 13:41:56'),
(40, 1, 1, '2026-09-11 13:41:56'),
(41, 1, 5, '2026-09-11 13:41:56'),
(42, 1, 9, '2026-09-11 13:41:56'),
(43, 1, 4, '2026-09-11 13:41:56'),
(44, 1, 6, '2026-09-11 13:41:56'),
(45, 1, 7, '2026-09-11 13:41:56'),
(46, 1, 10, '2026-09-11 13:41:56'),
(47, 1, 2, '2026-09-11 13:41:58'),
(48, 1, 5, '2026-09-11 13:41:58'),
(49, 1, 1, '2026-09-11 13:41:58'),
(50, 1, 6, '2026-09-11 13:41:58'),
(51, 1, 7, '2026-09-11 13:41:58'),
(52, 1, 4, '2026-09-11 13:41:58'),
(53, 1, 9, '2026-09-11 13:41:58'),
(54, 1, 10, '2026-09-11 13:41:58');

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `ranking_global`
-- (Veja abaixo para a visão atual)
--
CREATE TABLE `ranking_global` (
`alimento_id` int(10) unsigned
,`nome` varchar(500)
,`total_pesquisas` bigint(21)
,`media_calorias` decimal(8,1)
,`media_proteinas` decimal(8,1)
,`pontuacao_saudavel` decimal(14,2)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `ranking_pessoal`
-- (Veja abaixo para a visão atual)
--
CREATE TABLE `ranking_pessoal` (
`usuario_id` int(10) unsigned
,`alimento_id` int(10) unsigned
,`nome` varchar(500)
,`total_pesquisas` bigint(21)
,`media_calorias` decimal(8,1)
,`media_proteinas` decimal(8,1)
,`pontuacao_saudavel` decimal(14,2)
);

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(10) UNSIGNED NOT NULL,
  `email` varchar(150) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `data_cadastro` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `email`, `senha_hash`, `nome`, `data_cadastro`) VALUES
(1, 'matias.2023319620@aluno.iffar.edu.br', '$2y$10$rU/MD.K0wJrptZKypj61TuA6NjGjidoPlIwzFpsYyoAtmaIiWUAdu', 'Matias Neto', '2026-09-11 13:13:00');

-- --------------------------------------------------------

--
-- Estrutura para view `ranking_global`
--
DROP TABLE IF EXISTS `ranking_global`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY INVOKER VIEW `ranking_global`  AS SELECT `a`.`id` AS `alimento_id`, `a`.`nome` AS `nome`, count(`h`.`id`) AS `total_pesquisas`, round(avg(`a`.`calorias`),1) AS `media_calorias`, round(avg(`a`.`proteinas`),1) AS `media_proteinas`, round(greatest(0,avg(`a`.`proteinas`) * 2 - avg(`a`.`calorias`) / 10 - avg(coalesce(`a`.`gorduras`,0)) * 1.5 - avg(coalesce(`a`.`acucares`,0)) * 0.5 + avg(coalesce(`a`.`fibras`,0)) * 1.5),2) AS `pontuacao_saudavel` FROM (`historico_pesquisas` `h` join `alimentos` `a` on(`a`.`id` = `h`.`alimento_id`)) GROUP BY `a`.`id`, `a`.`nome` ;

-- --------------------------------------------------------

--
-- Estrutura para view `ranking_pessoal`
--
DROP TABLE IF EXISTS `ranking_pessoal`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY INVOKER VIEW `ranking_pessoal`  AS SELECT `u`.`id` AS `usuario_id`, `a`.`id` AS `alimento_id`, `a`.`nome` AS `nome`, count(`h`.`id`) AS `total_pesquisas`, round(avg(`a`.`calorias`),1) AS `media_calorias`, round(avg(`a`.`proteinas`),1) AS `media_proteinas`, round(greatest(0,avg(`a`.`proteinas`) * 2 - avg(`a`.`calorias`) / 10 - avg(coalesce(`a`.`gorduras`,0)) * 1.5 - avg(coalesce(`a`.`acucares`,0)) * 0.5 + avg(coalesce(`a`.`fibras`,0)) * 1.5),2) AS `pontuacao_saudavel` FROM ((`historico_pesquisas` `h` join `alimentos` `a` on(`a`.`id` = `h`.`alimento_id`)) join `usuarios` `u` on(`u`.`id` = `h`.`usuario_id`)) GROUP BY `u`.`id`, `a`.`id`, `a`.`nome` ;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `alimentos`
--
ALTER TABLE `alimentos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_codigo_barras` (`codigo_barras`);
ALTER TABLE `alimentos` ADD FULLTEXT KEY `ft_nome` (`nome`);

--
-- Índices de tabela `historico_pesquisas`
--
ALTER TABLE `historico_pesquisas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_data` (`usuario_id`,`data_pesquisa`),
  ADD KEY `idx_alimento` (`alimento_id`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `alimentos`
--
ALTER TABLE `alimentos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `historico_pesquisas`
--
ALTER TABLE `historico_pesquisas`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `historico_pesquisas`
--
ALTER TABLE `historico_pesquisas`
  ADD CONSTRAINT `fk_hist_alimento` FOREIGN KEY (`alimento_id`) REFERENCES `alimentos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_hist_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
