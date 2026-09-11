<?php
require_once __DIR__ . '/config.php';
echo "Config OK. PDO drivers: " . implode(',', PDO::getAvailableDrivers());