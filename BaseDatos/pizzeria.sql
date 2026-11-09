-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 09, 2026 at 02:16 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pizzeria`
--

-- --------------------------------------------------------

--
-- Table structure for table `detalle_temporal`
--

CREATE TABLE `detalle_temporal` (
  `id` int NOT NULL,
  `tamano` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ingredientes` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `num_pizzas` int NOT NULL,
  `subtotal` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ventas`
--

CREATE TABLE `ventas` (
  `id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_pedido` date NOT NULL,
  `total` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ventas`
--

INSERT INTO `ventas` (`id`, `nombre`, `direccion`, `telefono`, `fecha_pedido`, `total`) VALUES
(1, 'Miguel', 'San andres, leon 123', '477589123', '2026-11-08', 180),
(2, 'Marcos', 'Las trojes', '4791268134', '2026-11-07', 330),
(3, 'Marcos', 'Las trojes 12', '4778956231', '2026-11-08', 490),
(4, 'KAREN', 'San andres, leon 123', '4778956231', '2026-11-08', 180);

-- --------------------------------------------------------

--
-- Table structure for table `venta_detalle`
--

CREATE TABLE `venta_detalle` (
  `id` int NOT NULL,
  `venta_id` int NOT NULL,
  `tamano` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ingredientes` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `num_pizzas` int NOT NULL,
  `subtotal` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `venta_detalle`
--

INSERT INTO `venta_detalle` (`id`, `venta_id`, `tamano`, `ingredientes`, `num_pizzas`, `subtotal`) VALUES
(1, 1, 'Mediana', 'Champiñones', 2, 180),
(2, 2, 'Mediana', 'Champiñones', 3, 270),
(3, 2, 'Chica', 'Jamón, Piña', 1, 60),
(5, 3, 'Chica', 'Piña, Champiñones', 1, 60),
(6, 3, 'Mediana', 'Jamón, Piña', 3, 300),
(7, 3, 'Grande', 'Champiñones', 1, 130),
(8, 4, 'Mediana', 'Piña', 2, 180);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `detalle_temporal`
--
ALTER TABLE `detalle_temporal`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `venta_detalle`
--
ALTER TABLE `venta_detalle`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_detalle_venta` (`venta_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `detalle_temporal`
--
ALTER TABLE `detalle_temporal`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `venta_detalle`
--
ALTER TABLE `venta_detalle`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `venta_detalle`
--
ALTER TABLE `venta_detalle`
  ADD CONSTRAINT `fk_detalle_venta` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
