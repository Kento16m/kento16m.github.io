// Importa los módulos necesarios
import { DataService } from "./dataService.js" // Asegúrate de que la ruta sea correcta
import * as XLSX from "xlsx"

// Inicializa el servicio de datos
const dataService = new DataService()

// Script principal para el panel de administración
document.addEventListener("DOMContentLoaded", async () => {
  // Elementos del DOM
  const tableBody = document.getElementById("tableBody")
  const noData = document.getElementById("noData")
  const searchInput = document.getElementById("searchInput")
  const searchButton = document.getElementById("searchButton")
  const exportExcelButton = document.getElementById("exportExcel")
  const clearDataButton = document.getElementById("clearData")
  const expirationFilter = document.getElementById("expirationFilter")
  const applyFilterButton = document.getElementById("applyFilter")
  const renewModal = document.getElementById("renewModal")
  const renewForm = document.getElementById("renewForm")
  const cancelRenew = document.getElementById("cancelRenew")
  const memberId = document.getElementById("memberId")

  // Cargar datos de miembros
  async function loadData() {
    try {
      return await dataService.getData("inscripcionData")
    } catch (error) {
      console.error("Error al cargar datos:", error)
      return []
    }
  }

  // Mostrar datos en la tabla
  function displayData(data) {
    tableBody.innerHTML = ""

    if (data.length === 0) {
      noData.style.display = "block"
      return
    }

    noData.style.display = "none"

    // Fecha actual para cálculos de vencimiento
    const currentDate = new Date()

    data.forEach((item, index) => {
      // Calcular fecha de vencimiento (30 días después del registro o de la última renovación)
      const registrationDate = new Date(item.fecha_inscripcion)
      const lastRenewalDate = item.ultima_renovacion ? new Date(item.ultima_renovacion) : registrationDate

      // Duración del plan en días
      let planDuration = 30 // por defecto un mes
      if (item.plan && item.plan.includes("2 meses")) {
        planDuration = 60
      }

      const expirationDate = new Date(lastRenewalDate)
      expirationDate.setDate(expirationDate.getDate() + planDuration)

      // Formato de fecha legible
      const expirationDateFormatted = expirationDate.toLocaleDateString("es-ES")

      // Verificar estado de la membresía
      let status = "Activo"
      let statusClass = "status-active"

      // Calcular días hasta el vencimiento
      const daysToExpiration = Math.ceil((expirationDate - currentDate) / (1000 * 60 * 60 * 24))

      if (daysToExpiration <= 0) {
        status = "Vencido"
        statusClass = "status-expired"
      } else if (daysToExpiration <= 7) {
        status = `Por vencer (${daysToExpiration} día${daysToExpiration > 1 ? "s" : ""})`
        statusClass = "status-expiring"
      }

      // Si hay días asistidos registrados, mostrarlos en lugar del estado
      if (item.dias_asistidos) {
        const remainingDays = 30 - item.dias_asistidos
        if (remainingDays <= 0) {
          status = `${item.dias_asistidos} días asistidos - VENCIDO`
          statusClass = "status-expired"
        } else if (remainingDays <= 5) {
          status = `${item.dias_asistidos} días asistidos (${remainingDays} restantes)`
          statusClass = "status-expiring"
        } else {
          status = `${item.dias_asistidos} días asistidos (${remainingDays} restantes)`
        }
      }

      // Crear fila de la tabla
      const row = document.createElement("tr")
      row.className = statusClass

      row.innerHTML = `
                <td>${item.apellido || ""}</td>
                <td>${item.nombre || ""}</td>
                <td>${item.cedula || ""}</td>
                <td>${item.telefono || ""}</td>
                <td>${item.email || ""}</td>
                <td>${item.plan || ""}</td>
                <td>${item.horario || ""}</td>
                <td>${item.fecha_inscripcion || ""}</td>
                <td>${expirationDateFormatted}</td>
                <td class="${statusClass}">${status}</td>
                <td class="actions">
                    <button class="action-btn renew-btn" data-index="${index}" title="Renovar membresía">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="action-btn edit-btn" data-index="${index}" title="Editar miembro">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" data-index="${index}" title="Eliminar miembro">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `

      tableBody.appendChild(row)
    })

    // Agregar event listeners a los botones de acción
    document.querySelectorAll(".renew-btn").forEach((btn) => {
      btn.addEventListener("click", openRenewModal)
    })

    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", editMember)
    })

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", deleteMember)
    })
  }

  // Abrir modal de renovación
  function openRenewModal() {
    const index = this.getAttribute("data-index")
    memberId.value = index
    renewModal.style.display = "block"
  }

  // Cerrar modal de renovación
  function closeRenewModal() {
    renewModal.style.display = "none"
  }

  // Renovar membresía
  async function renewMembership(e) {
    e.preventDefault()

    const index = Number.parseInt(memberId.value)
    const plan = document.getElementById("renewPlan").value
    const paymentMethod = document.getElementById("paymentMethod").value

    try {
      // Obtener datos actuales
      const data = await loadData()

      // Actualizar información de membresía
      data[index].plan = plan
      data[index].ultima_renovacion = new Date().toISOString().split("T")[0]
      data[index].metodo_pago = paymentMethod
      data[index].dias_asistidos = 0 // Reiniciar días asistidos al renovar

      // Guardar datos actualizados
      await dataService.saveData("inscripcionData", data)

      // Cerrar modal y actualizar vista
      closeRenewModal()
      displayData(data)

      // Mostrar mensaje de éxito
      alert("Membresía renovada exitosamente")
    } catch (error) {
      console.error("Error al renovar membresía:", error)
      alert("Error al renovar membresía. Intenta nuevamente.")
    }
  }

  // Editar miembro
  function editMember() {
    const index = this.getAttribute("data-index")
    alert("Editar miembro con índice: " + index + "\nFuncionalidad por implementar")
    // Aquí puedes implementar la lógica para editar un miembro
  }

  // Eliminar miembro
  async function deleteMember() {
    if (!confirm("¿Está seguro que desea eliminar este miembro?")) {
      return
    }

    const index = Number.parseInt(this.getAttribute("data-index"))

    try {
      // Obtener datos actuales
      const data = await loadData()

      // Eliminar miembro del array
      data.splice(index, 1)

      // Guardar datos actualizados
      await dataService.saveData("inscripcionData", data)

      // Actualizar vista
      displayData(data)
    } catch (error) {
      console.error("Error al eliminar miembro:", error)
      alert("Error al eliminar miembro. Intenta nuevamente.")
    }
  }

  // Búsqueda de miembros
  async function searchMembers() {
    const searchTerm = searchInput.value.toLowerCase().trim()
    const data = await loadData()

    if (!searchTerm) {
      displayData(data)
      return
    }

    const filteredData = data.filter(
      (item) =>
        (item.nombre && item.nombre.toLowerCase().includes(searchTerm)) ||
        (item.apellido && item.apellido.toLowerCase().includes(searchTerm)) ||
        (item.telefono && item.telefono.includes(searchTerm)) ||
        (item.email && item.email.toLowerCase().includes(searchTerm)) ||
        (item.cedula && item.cedula.includes(searchTerm)),
    )

    displayData(filteredData)
  }

  // Aplicar filtro de vencimiento
  async function applyExpirationFilter() {
    const filterValue = expirationFilter.value
    const data = await loadData()

    if (filterValue === "all") {
      displayData(data)
      return
    }

    const currentDate = new Date()

    const filteredData = data.filter((item) => {
      // Si hay días asistidos, filtrar por eso
      if (item.dias_asistidos) {
        const remainingDays = 30 - item.dias_asistidos

        if (filterValue === "expired") {
          return remainingDays <= 0
        } else if (filterValue === "expiring") {
          return remainingDays > 0 && remainingDays <= 7
        } else if (filterValue === "active") {
          return remainingDays > 7
        }
      } else {
        // Calcular fecha de vencimiento
        const registrationDate = new Date(item.fecha_inscripcion)
        const lastRenewalDate = item.ultima_renovacion ? new Date(item.ultima_renovacion) : registrationDate

        // Duración del plan en días
        let planDuration = 30 // por defecto un mes
        if (item.plan && item.plan.includes("2 meses")) {
          planDuration = 60
        }

        const expirationDate = new Date(lastRenewalDate)
        expirationDate.setDate(expirationDate.getDate() + planDuration)

        // Calcular días hasta el vencimiento
        const daysToExpiration = Math.ceil((expirationDate - currentDate) / (1000 * 60 * 60 * 24))

        if (filterValue === "expired") {
          return daysToExpiration <= 0
        } else if (filterValue === "expiring") {
          return daysToExpiration > 0 && daysToExpiration <= 7
        } else if (filterValue === "active") {
          return daysToExpiration > 7
        }
      }

      return true
    })

    displayData(filteredData)
  }

  // Exportar a Excel
  async function exportToExcel() {
    const data = await loadData()

    if (data.length === 0) {
      alert("No hay datos para exportar")
      return
    }

    // Preparar datos para exportación
    const exportData = data.map((item) => {
      // Calcular fecha de vencimiento
      const registrationDate = new Date(item.fecha_inscripcion)
      const lastRenewalDate = item.ultima_renovacion ? new Date(item.ultima_renovacion) : registrationDate

      // Duración del plan en días
      let planDuration = 30 // por defecto un mes
      if (item.plan && item.plan.includes("2 meses")) {
        planDuration = 60
      }

      const expirationDate = new Date(lastRenewalDate)
      expirationDate.setDate(expirationDate.getDate() + planDuration)

      // Calcular días asistidos
      const diasAsistidos = item.dias_asistidos || 0
      const diasRestantes = 30 - diasAsistidos

      return {
        Apellido: item.apellido || "",
        Nombre: item.nombre || "",
        Cédula: item.cedula || "",
        Teléfono: item.telefono || "",
        Email: item.email || "",
        Plan: item.plan || "",
        Horario: item.horario || "",
        "Fecha de Registro": item.fecha_inscripcion || "",
        "Fecha de Vencimiento": expirationDate.toLocaleDateString("es-ES"),
        "Días Asistidos": diasAsistidos,
        "Días Restantes": diasRestantes > 0 ? diasRestantes : 0,
      }
    })

    // Crear hoja de Excel
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Miembros")

    // Generar nombre de archivo con fecha
    const date = new Date()
    const fileName = `MacroGym_Miembros_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.xlsx`

    // Descargar archivo
    XLSX.writeFile(wb, fileName)
  }

  // Borrar todos los datos
  async function clearAllData() {
    if (!confirm("¿Está seguro que desea borrar todos los datos? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      // Limpiar datos en el servicio
      await dataService.saveData("inscripcionData", [])

      // Limpiar localStorage también
      localStorage.removeItem("inscripcionData")

      // Actualizar vista
      displayData([])

      alert("Todos los datos han sido eliminados correctamente")
    } catch (error) {
      console.error("Error al eliminar datos:", error)
      alert("Error al eliminar datos. Intenta nuevamente.")
    }
  }

  // Event listeners
  searchButton.addEventListener("click", searchMembers)
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      searchMembers()
    }
  })

  applyFilterButton.addEventListener("click", applyExpirationFilter)

  exportExcelButton.addEventListener("click", exportToExcel)
  clearDataButton.addEventListener("click", clearAllData)

  // Event listeners para el modal de renovación
  document.querySelector(".close-modal").addEventListener("click", closeRenewModal)
  cancelRenew.addEventListener("click", closeRenewModal)
  renewForm.addEventListener("submit", renewMembership)

  // Cerrar el modal al hacer clic fuera de él
  window.addEventListener("click", (event) => {
    if (event.target === renewModal) {
      closeRenewModal()
    }
  })

  // Cargar datos iniciales
  try {
    const initialData = await loadData()
    displayData(initialData)
  } catch (error) {
    console.error("Error al cargar datos iniciales:", error)
    noData.style.display = "block"
  }
})

