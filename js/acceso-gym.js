// Control de acceso al gimnasio
document.addEventListener("DOMContentLoaded", async () => {
  // Elementos del DOM
  const accessForm = document.getElementById("accessForm")
  const documentNumberInput = document.getElementById("documentNumber")
  const accessResult = document.getElementById("accessResult")
  const userInfoCard = document.getElementById("userInfoCard")
  const accessHistoryCard = document.getElementById("accessHistoryCard")
  const accessHistoryList = document.getElementById("accessHistory")

  // Import dataService or declare it
  const dataService = {
    getData: async (key) => {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    },
    saveData: async (key, data) => {
      localStorage.setItem(key, JSON.stringify(data))
    },
  }

  // Función para inicializar datos de ejemplo si no existen
  async function initializeData() {
    // Si no existe la data de inscripciones, no hacer nada
    if (!localStorage.getItem("inscripcionData")) {
      console.log("No hay datos de inscripción disponibles")
    }

    // Inicializar datos de acceso si no existen
    if (!localStorage.getItem("accessData")) {
      localStorage.setItem("accessData", JSON.stringify([]))
      await dataService.saveData("accessData", [])
    }
  }

  // Inicializar datos
  await initializeData()

  // Función para verificar si un usuario existe
  async function findUser(documentNumber) {
    const users = await dataService.getData("inscripcionData")
    return users.find((user) => user.cedula === documentNumber)
  }

  // Función para obtener los accesos de un usuario
  async function getUserAccesses(documentNumber) {
    const accesses = await dataService.getData("accessData")
    return accesses.filter((access) => access.cedula === documentNumber)
  }

  // Función para contar cuántos días ha asistido un usuario
  function countAttendanceDays(userAccesses) {
    // Convertimos las fechas de acceso a formato YYYY-MM-DD para contar días únicos
    const uniqueDays = new Set()

    userAccesses.forEach((access) => {
      const accessDate = new Date(access.timestamp)
      const dateString = accessDate.toISOString().split("T")[0]
      uniqueDays.add(dateString)
    })

    return uniqueDays.size
  }

  // Función para registrar un acceso nuevo
  async function registerAccess(user) {
    const now = new Date()
    const timestamp = now.toISOString()

    // Nuevo objeto de acceso
    const newAccess = {
      cedula: user.cedula,
      nombre: user.nombre,
      apellido: user.apellido,
      timestamp: timestamp,
      tipo: "entrada",
    }

    // Obtener datos actuales y agregar el nuevo acceso
    const accessData = await dataService.getData("accessData")
    accessData.push(newAccess)

    // Guardar datos actualizados
    await dataService.saveData("accessData", accessData)

    // Actualizar los días asistidos en los datos del usuario
    await updateUserAttendanceDays(user.cedula, countAttendanceDays(await getUserAccesses(user.cedula)))

    return newAccess
  }

  // Función para actualizar los días asistidos en los datos del usuario
  async function updateUserAttendanceDays(cedula, attendanceDays) {
    const users = await dataService.getData("inscripcionData")
    const userIndex = users.findIndex((user) => user.cedula === cedula)

    if (userIndex !== -1) {
      // Agregar o actualizar la propiedad dias_asistidos
      users[userIndex].dias_asistidos = attendanceDays
      await dataService.saveData("inscripcionData", users)
    }
  }

  // Función para actualizar la UI con la información del usuario
  function updateUserUI(user, attendanceDays) {
    const remainingDays = 30 - attendanceDays
    let statusClass = "active"
    let statusText = "Activa"

    if (remainingDays <= 5 && remainingDays > 0) {
      statusClass = "expiring"
      statusText = "Por vencer"
    } else if (remainingDays <= 0) {
      statusClass = "expired"
      statusText = "Vencida"
    }

    const userInitials = `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`

    userInfoCard.innerHTML = `
            <div class="user-header">
                <div class="user-avatar">${userInitials}</div>
                <div class="user-details">
                    <h3>${user.nombre} ${user.apellido}</h3>
                    <p>C.I.: ${user.cedula}</p>
                </div>
            </div>
            
            <div class="user-stats">
                <div class="stat-item">
                    <div class="stat-value">${attendanceDays}</div>
                    <div class="stat-label">Días Asistidos</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${remainingDays < 0 ? 0 : remainingDays}</div>
                    <div class="stat-label">Días Restantes</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${user.plan}</div>
                    <div class="stat-label">Plan</div>
                </div>
            </div>
            
            <div class="membership-status ${statusClass}">
                <i class="fas fa-${statusClass === "active" ? "check-circle" : statusClass === "expiring" ? "exclamation-circle" : "times-circle"}"></i>
                Membresía ${statusText} - ${statusClass === "expired" ? "Necesita renovar" : `${remainingDays} días restantes`}
            </div>
        `

    userInfoCard.classList.add("visible")
  }

  // Función para mostrar historial de accesos
  function showAccessHistory(userAccesses) {
    // Ordenar accesos por fecha (más recientes primero)
    const sortedAccesses = [...userAccesses].sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp)
    })

    // Mostrar solo los últimos 10 accesos
    const recentAccesses = sortedAccesses.slice(0, 10)

    // Limpiar lista actual
    accessHistoryList.innerHTML = ""

    if (recentAccesses.length === 0) {
      accessHistoryList.innerHTML = '<div class="history-item">No hay registros de acceso previos</div>'
    } else {
      recentAccesses.forEach((access) => {
        const accessDate = new Date(access.timestamp)

        // Formatear fecha y hora
        const dateOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
        const timeOptions = { hour: "2-digit", minute: "2-digit" }

        const formattedDate = accessDate.toLocaleDateString("es-ES", dateOptions)
        const formattedTime = accessDate.toLocaleTimeString("es-ES", timeOptions)

        // Crear elemento de historial
        const historyItem = document.createElement("div")
        historyItem.className = "history-item"
        historyItem.innerHTML = `
                    <div class="history-date">${formattedDate}</div>
                    <div class="history-time">${formattedTime}</div>
                `

        accessHistoryList.appendChild(historyItem)
      })
    }

    accessHistoryCard.classList.add("visible")
  }

  // Función para mostrar mensaje de resultado
  function showResult(message, type) {
    accessResult.innerHTML = message
    accessResult.className = "access-result " + type

    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
      accessResult.className = "access-result"
    }, 5000)
  }

  // Escuchar envío del formulario de acceso
  accessForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const documentNumber = documentNumberInput.value.trim()

    if (!documentNumber) {
      showResult('<i class="fas fa-exclamation-circle"></i> Por favor, ingresa tu número de documento', "error")
      return
    }

    // Mostrar mensaje de carga
    showResult('<i class="fas fa-spinner fa-spin"></i> Verificando...', "info")

    try {
      // Buscar usuario
      const user = await findUser(documentNumber)

      if (!user) {
        showResult(
          '<i class="fas fa-times-circle"></i> Usuario no encontrado. Verifica tu número de documento o regístrate.',
          "error",
        )
        userInfoCard.classList.remove("visible")
        accessHistoryCard.classList.remove("visible")
        return
      }

      // Registrar acceso
      await registerAccess(user)

      // Obtener accesos del usuario
      const userAccesses = await getUserAccesses(documentNumber)

      // Contar días de asistencia
      const attendanceDays = countAttendanceDays(userAccesses)

      // Actualizar UI
      updateUserUI(user, attendanceDays)
      showAccessHistory(userAccesses)

      if (attendanceDays >= 30) {
        showResult(
          `<i class="fas fa-exclamation-triangle"></i> ¡Acceso registrado! Tu membresía ha vencido (${attendanceDays} días). Por favor, renueva tu plan.`,
          "warning",
        )
      } else {
        showResult(
          `<i class="fas fa-check-circle"></i> ¡Acceso registrado correctamente! Has asistido ${attendanceDays} de 30 días.`,
          "success",
        )
      }

      // Limpiar formulario
      documentNumberInput.value = ""
    } catch (error) {
      console.error("Error al procesar acceso:", error)
      showResult(
        '<i class="fas fa-exclamation-triangle"></i> Error al procesar tu acceso. Intenta nuevamente.',
        "error",
      )
    }
  })
})

