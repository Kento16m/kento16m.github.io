<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = $_POST["nombre"];
    $apellidos = $_POST["apellidos"];
    $email = $_POST["email"];
    $telefono = $_POST["telefono"];
    $mensaje = $_POST["mensaje"];

    $destinatario = "kentoramirez16@gmail.com";
    $asunto = "Nuevo mensaje de contacto";
    $cuerpo = "Nombre: " . $nombre . " " . $apellidos . "\n";
    $cuerpo .= "Email: " . $email . "\n";
    $cuerpo .= "Teléfono: " . $telefono . "\n";
    $cuerpo .= "Mensaje: " . $mensaje;

    $headers = "From: " . $email;

    if (mail($destinatario, $asunto, $cuerpo, $headers)) {
        echo "Mensaje enviado correctamente.";
    } else {
        echo "Error al enviar el mensaje.";
    }
}
?>