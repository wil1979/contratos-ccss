<?php
include("conexion.php");

// Consulta todos los registros
$consulta = "SELECT * FROM registros";
$resultado = $conex->query($consulta);

// Abrir archivo CSV
$archivo = fopen("registros.csv", "w");

// Encabezados
$encabezados = ["inicio", "final", "dias", "codigo", "cedula", "funcionario", "salario", "comentario", "estado"];
fputcsv($archivo, $encabezados);

// Filas
while ($fila = $resultado->fetch_assoc()) {
    fputcsv($archivo, [
        $fila["inicio"],
        $fila["final"],
        $fila["dias"],
        $fila["codigo"],
        $fila["cedula"],
        $fila["funcionario"],
        $fila["salario"],
        $fila["comentario"],
        $fila["estado"]
    ]);
}

fclose($archivo);

echo "✅ Datos exportados a <a href='registros.csv'>registros.csv</a>";
?>
