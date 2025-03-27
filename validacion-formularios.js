// Función para validar formularios de inscripción y clientes
document.addEventListener("DOMContentLoaded", () => {
  // Seleccionar los formularios
  const inscripcionForm = document.getElementById("inscripcionForm")
  const clientesForm = document.getElementById("clientesForm")

  console.log("Script de validación cargado")
  console.log("Formulario de inscripción encontrado:", inscripcionForm !== null)
  console.log("Formulario de clientes encontrado:", clientesForm !== null)

  // Función para validar nombres y apellidos (solo letras y espacios)
  function validarNombreApellido(valor) {
    // Permitir letras, espacios, acentos y ñ
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,30}$/
    return regex.test(valor)
  }

  // Función para validar C.I. (solo números, entre 6 y 10 dígitos)
  function validarCI(valor) {
    const regex = /^[0-9]{6,10}$/
    return regex.test(valor)
  }

  // Función para validar fecha de nacimiento (edad entre 12 y 90 años)
  function validarFechaNacimiento(fecha) {
    const fechaNacimiento = new Date(fecha)
    const hoy = new Date()

    // Verificar que la fecha no sea futura
    if (fechaNacimiento > hoy) {
      return false
    }

    // Calcular edad
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear()
    const mes = hoy.getMonth() - fechaNacimiento.getMonth()

    // Ajustar edad si aún no ha cumplido años en este año
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--
    }

    // Verificar rango de edad (12-90 años)
    return edad >= 12 && edad <= 90
  }

  // Función para mostrar mensaje de error
  function mostrarError(input, mensaje) {
    // Eliminar mensaje de error previo si existe
    const errorPrevio = input.parentElement.querySelector(".error-message")
    if (errorPrevio) {
      errorPrevio.remove()
    }

    // Crear y añadir mensaje de error
    const errorMessage = document.createElement("div")
    errorMessage.className = "error-message"
    errorMessage.style.color = "red"
    errorMessage.style.fontSize = "0.8rem"
    errorMessage.style.marginTop = "5px"
    errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensaje}`

    // Añadir después del input
    input.parentElement.appendChild(errorMessage)

    // Resaltar campo con error
    input.style.borderColor = "red"
    input.style.backgroundColor = "rgba(255, 0, 0, 0.05)"
  }

  // Función para limpiar mensaje de error
  function limpiarError(input) {
    const errorMessage = input.parentElement.querySelector(".error-message")
    if (errorMessage) {
      errorMessage.remove()
    }

    // Restaurar estilo del campo
    input.style.borderColor = ""
    input.style.backgroundColor = ""
  }

  // Validar campo al perder el foco
  function validarCampo(input) {
    const valor = input.value.trim()

    // Validar según el tipo de campo
    switch (input.id) {
      case "nombre":
        if (!validarNombreApellido(valor)) {
          mostrarError(input, "Ingrese un nombre válido (solo letras, 2-30 caracteres)")
          return false
        }
        break
      case "apellido":
        if (!validarNombreApellido(valor)) {
          mostrarError(input, "Ingrese un apellido válido (solo letras, 2-30 caracteres)")
          return false
        }
        break
      case "cedula":
        if (!validarCI(valor)) {
          mostrarError(input, "Ingrese un número de C.I. válido (6-10 dígitos)")
          return false
        }
        break
      case "fecha_nacimiento":
        if (!validarFechaNacimiento(valor)) {
          mostrarError(input, "Ingrese una fecha válida (edad entre 12 y 90 años)")
          return false
        }
        break
    }

    limpiarError(input)
    return true
  }

  // Configurar validación para el formulario de inscripción
  if (inscripcionForm) {
    console.log("Configurando validación para formulario de inscripción")

    // Validar campos al perder el foco
    const camposAValidar = ["nombre", "apellido", "cedula", "fecha_nacimiento"]

    camposAValidar.forEach((campo) => {
      const input = document.getElementById(campo)
      if (input) {
        console.log(`Configurando validación para campo ${campo}`)
        input.addEventListener("blur", function () {
          validarCampo(this)
        })
      } else {
        console.log(`Campo ${campo} no encontrado`)
      }
    })

    // Validar todo el formulario al enviar
    inscripcionForm.addEventListener("submit", (e) => {
      console.log("Validando formulario de inscripción al enviar")
      let formValido = true

      // Validar cada campo
      camposAValidar.forEach((campo) => {
        const input = document.getElementById(campo)
        if (input) {
          if (!validarCampo(input)) {
            formValido = false
          }
        }
      })

      // Prevenir envío si hay errores
      if (!formValido) {
        e.preventDefault()
        // Mostrar mensaje general de error
        alert("Por favor, corrija los errores en el formulario antes de enviar.")
      }
    })
  }

  // Configurar validación para el formulario de clientes
  if (clientesForm) {
    console.log("Configurando validación para formulario de clientes")

    // Validar campos al perder el foco
    const camposAValidar = ["nombre", "apellido", "cedula", "fecha_nacimiento"]

    camposAValidar.forEach((campo) => {
      const input = document.getElementById(campo)
      if (input) {
        console.log(`Configurando validación para campo ${campo}`)
        input.addEventListener("blur", function () {
          validarCampo(this)
        })
      } else {
        console.log(`Campo ${campo} no encontrado`)
      }
    })

    // Validar todo el formulario al enviar
    clientesForm.addEventListener("submit", (e) => {
      console.log("Validando formulario de clientes al enviar")
      let formValido = true

      // Validar cada campo
      camposAValidar.forEach((campo) => {
        const input = document.getElementById(campo)
        if (input) {
          if (!validarCampo(input)) {
            formValido = false
          }
        }
      })

      // Prevenir envío si hay errores
      if (!formValido) {
        e.preventDefault()
        // Mostrar mensaje general de error
        alert("Por favor, corrija los errores en el formulario antes de enviar.")
      }
    })
  }

  // Verificar si estamos en la página de inscripción o clientes por la URL
  const paginaActual = window.location.pathname
  console.log("Página actual:", paginaActual)

  if (paginaActual.includes("inscripcion.html") && !inscripcionForm) {
    console.error("Estamos en la página de inscripción pero no se encontró el formulario con ID 'inscripcionForm'")
  }

  if (paginaActual.includes("clientes.html") && !clientesForm) {
    console.error("Estamos en la página de clientes pero no se encontró el formulario con ID 'clientesForm'")
  }
})

