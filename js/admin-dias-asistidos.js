// Import dataService (assuming it's in a separate module)
import { dataService } from "./dataService.js" // Adjust the path as needed

// Script para mostrar días asistidos en el panel de administración
document.addEventListener("DOMContentLoaded", async () => {
  // Función para obtener los accesos de un usuario
  async function getUserAccesses(documentNumber) {
    try {
      const accesses = await dataService.getData("accessData")
      return accesses.filter((access) => access.cedula === documentNumber)
    } catch (error) {
      console.error("Error al obtener accesos:", error)
      return []
    }
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
  async function updateAttendanceDisplay() {
    const tableRows = document.querySelectorAll("#tableBody tr")

    for (const row of tableRows) {
      const cedulaCell = row.querySelector("td:nth-child(3)")
      const statusCell = row.querySelector("td:nth-child(10)")

      if (cedulaCell && statusCell) {
        const cedula = cedulaCell.textContent.trim()
        try {
          const userAccesses = await getUserAccesses(cedula)
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
        } catch (error) {
          console.error(`Error al actualizar días para cédula ${cedula}:`, error)
        }
      }
    }
  }

  // Actualizar la visualización al cargar la página
  try {
    await updateAttendanceDisplay()

    // Configurar un intervalo para actualizar la visualización cada 30 segundos
    setInterval(async () => {
      await updateAttendanceDisplay()
    }, 30000)
  } catch (error) {
    console.error("Error al inicializar la visualización de días asistidos:", error)
  }
})

