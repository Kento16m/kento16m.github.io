// Script para mostrar días asistidos en el panel de administración
document.addEventListener("DOMContentLoaded", () => {
  // Función para obtener los accesos de un usuario
  function getUserAccesses(documentNumber) {
    const accesses = JSON.parse(localStorage.getItem("accessData")) || []
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

  // Función para actualizar la visualización de días asistidos en la tabla
  function updateAttendanceDisplay() {
    const tableRows = document.querySelectorAll("#tableBody tr")

    tableRows.forEach((row) => {
      const cedulaCell = row.querySelector("td:nth-child(3)")
      const statusCell = row.querySelector("td:nth-child(10)")

      if (cedulaCell && statusCell) {
        const cedula = cedulaCell.textContent.trim()
        const userAccesses = getUserAccesses(cedula)
        const attendanceDays = countAttendanceDays(userAccesses)
        const remainingDays = 30 - attendanceDays

        // Actualizar el contenido de la celda de estado
        if (attendanceDays > 0) {
          let statusClass = "status-active"
          let statusText = ""

          if (remainingDays <= 0) {
            statusClass = "status-expired"
            statusText = `${attendanceDays} días asistidos - VENCIDO`
          } else if (remainingDays <= 5) {
            statusClass = "status-expiring"
            statusText = `${attendanceDays} días asistidos (${remainingDays} restantes)`
          } else {
            statusText = `${attendanceDays} días asistidos (${remainingDays} restantes)`
          }

          statusCell.innerHTML = statusText
          statusCell.className = statusClass

          // Actualizar la clase de la fila
          row.className = statusClass
        }
      }
    })
  }

  // Actualizar la visualización al cargar la página
  updateAttendanceDisplay()

  // Configurar un intervalo para actualizar la visualización cada 10 segundos
  setInterval(updateAttendanceDisplay, 10000)
})

