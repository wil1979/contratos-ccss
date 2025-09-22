<?php
include("conexion.php");

// Consulta todos los registros
$consulta = "SELECT * FROM registros";
$resultado = $conex->query($consulta);

$data = [];
while ($fila = $resultado->fetch_assoc()) {
    $data[] = $fila;
}

// Exportar a archivo JSON
$archivo = "registros.json";
file_put_contents($archivo, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo "✅ Datos exportados a <a href='$archivo'>$archivo</a>";
?>
