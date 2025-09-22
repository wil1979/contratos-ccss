<?php
// migrar_nombramientos.php
require_once 'conexion.php'; // Asume que define $conexion como objeto mysqli

use Google\Cloud\Firestore\FirestoreClient;

// Incluir Firebase Admin SDK (debes instalarlo con Composer)
// Si no lo tienes, sigue las instrucciones más abajo
require_once __DIR__ . '/vendor/autoload.php';

// Inicializar Firestore
$firestore = new FirestoreClient([
    'projectId' => 'interinos-ccss',
]);

// Obtener todos los registros de MySQL
$sql = "SELECT id, inicio, final, dias, codigo, cedula, funcionario, salario, comentario, estado FROM tu_tabla_nombramientos";
$resultado = $conexion->query($sql);

if (!$resultado) {
    die("Error en la consulta MySQL: " . $conexion->error);
}

$coleccion = $firestore->collection('nombramientos');
$contador = 0;

echo "Iniciando migración...\n";

while ($fila = $resultado->fetch_assoc()) {
    try {
        // Convertir y mapear campos
        $documento = [
            'inicio' => $fila['inicio'] ?? '',
            'final' => $fila['final'] ?? '',
            'dias' => (int) ($fila['dias'] ?? 0),
            'codArea' => (string) ($fila['codigo'] ?? ''),
            'area' => 'Área no especificada', // O podrías omitir este campo
            'horarioEntrada' => '07:00',
            'horarioSalida' => '16:00',
            'salario' => (float) ($fila['salario'] ?? 0.0),
            'comentario' => $fila['comentario'] ?? '',
            'estado' => ($fila['estado'] ?? '') === 'Pagado', // Asume que "Pagado" = true
            'personaSustituirCedula' => '',
            'personaSustituirNombre' => '',
            'usuarioCedula' => $fila['cedula'] ?? '',
            'usuarioNombre' => $fila['funcionario'] ?? '',
            'creadoEn' => new DateTime(), // Timestamp actual
        ];

        // Guardar en Firestore
        $coleccion->add($documento);
        $contador++;

        echo "Registro migrado: ID MySQL {$fila['id']} → Firestore\n";

    } catch (Exception $e) {
        echo "Error al migrar registro ID {$fila['id']}: " . $e->getMessage() . "\n";
    }
}

echo "\n¡Migración completada! {$contador} registros migrados.\n";
?>