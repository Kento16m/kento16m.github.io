// Script para mostrar días asistidos en el panel de administración
document.addEventListener("DOMContentLoaded", () => {
  // Función para obtener la hora correcta (sin ajuste de hora)
  function getCorrectDateTime() {
    const now = new Date()
    // Eliminamos el ajuste de hora
    return now
  }

  // Función para usar la fecha original sin ajuste
  function adjustTimeForDisplay(date) {
    const adjustedDate = new Date(date)
    // Eliminamos el ajuste de hora
    return adjustedDate
  }

  // Función para obtener los accesos de un usuario
  function getUserAccesses(documentNumber) {
    const accesses = JSON.parse(localStorage.getItem("accessData")) || []
    return accesses.filter((access) => access.cedula === documentNumber)
  }

  // Función para contar cuántos días ha asistido un usuario en el mes actual
  function countCurrentMonthAttendanceDays(userAccesses) {
    // Obtener el mes y año actual con la hora corregida
    const currentDate = getCorrectDateTime()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    // Filtrar accesos del mes actual
    const currentMonthAccesses = userAccesses.filter((access) => {
      const accessDate = adjustTimeForDisplay(access.timestamp)
      return accessDate.getMonth() + 1 === currentMonth && accessDate.getFullYear() === currentYear
    })

    // Convertimos las fechas de acceso a formato YYYY-MM-DD para contar días únicos
    const uniqueDays = new Set()

    currentMonthAccesses.forEach((access) => {
      const accessDate = adjustTimeForDisplay(access.timestamp)
      const dateString = accessDate.toISOString().split("T")[0]
      uniqueDays.add(dateString)
    })

    return uniqueDays.size
  }

  // Función para calcular días transcurridos desde la inscripción
  function calculateDaysSinceRegistration(user) {
    const registrationDate = new Date(user.fecha_inscripcion)
    const lastRenewalDate = user.ultima_renovacion ? new Date(user.ultima_renovacion) : registrationDate
    const currentDate = getCorrectDateTime()

    // Calcular diferencia en días
    const diffTime = currentDate - lastRenewalDate
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays > 0 ? diffDays : 0
  }

  // Función para actualizar la visualización de días asistidos en la tabla
  function updateAttendanceDisplay() {
    const tableRows = document.querySelectorAll("#tableBody tr")
    const users = JSON.parse(localStorage.getItem("inscripcionData")) || []

    tableRows.forEach((row) => {
      const cedulaCell = row.querySelector("td:nth-child(3)")
      const statusCell = row.querySelector("td:nth-child(10)")

      if (cedulaCell && statusCell) {
        const cedula = cedulaCell.textContent.trim()
        const user = users.find((u) => u.cedula === cedula)

        if (!user) return

        const userAccesses = getUserAccesses(cedula)
        const attendanceDays = countCurrentMonthAttendanceDays(userAccesses)

        // Calcular días transcurridos y restantes
        const daysSinceRegistration = calculateDaysSinceRegistration(user)
        const remainingDays = 30 - daysSinceRegistration

        // Determinar estado de la membresía
        let statusClass = "status-active"
        let statusText = ""

        if (remainingDays <= 0) {
          statusClass = "status-expired"
          statusText = `${attendanceDays} días este mes - VENCIDO (${daysSinceRegistration} días desde registro)`
        } else if (remainingDays <= 5) {
          statusClass = "status-expiring"
          statusText = `${attendanceDays} días este mes (${remainingDays} días para vencer)`
        } else {
          statusText = `${attendanceDays} días este mes (${remainingDays} días restantes)`
        }

        statusCell.innerHTML = statusText
        statusCell.className = statusClass

        // Actualizar la clase de la fila
        row.className = statusClass
      }
    })
  }

  // Actualizar la visualización al cargar la página
  updateAttendanceDisplay()

  // Configurar un intervalo para actualizar la visualización cada 10 segundos
  setInterval(updateAttendanceDisplay, 10000)
})

