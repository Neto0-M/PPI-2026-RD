<?php
echo "1 - antes<br>";
require_once __DIR__ . '/config.php';
echo "2 - depois<br>";
echo "PDO: " . implode(',', PDO::getAvailableDrivers());