document.addEventListener("DOMContentLoaded", () => {
  console.log("🧪 MODO DE TESTE ATIVADO - Sem webhooks 🧪")

  // Funções de armazenamento
  function getStorage(name) {
    try {
      let value = localStorage.getItem(name)
      if (value) return value
      value = sessionStorage.getItem(name)
      return value
    } catch (error) {
      console.error("Erro ao ler do storage:", error)
      return null
    }
  }

  function setStorage(name, value) {
    try {
      localStorage.setItem(name, value)
      sessionStorage.setItem(name, value)
    } catch (error) {
      console.error("Erro ao salvar no storage:", error)
    }
  }

  function removeStorage(name) {
    try {
      localStorage.removeItem(name)
      sessionStorage.removeItem(name)
    } catch (error) {
      console.error("Erro ao remover do storage:", error)
    }
  }

  function showCustomAlert(message, type = "error") {
    const existingAlerts = document.querySelectorAll(".custom-alert")
    existingAlerts.forEach((alert) => alert.remove())

    const alertModal = document.createElement("div")
    alertModal.className = `modal custom-alert ${type}-alert`
    alertModal.style.display = "flex"

    const iconMap = {
      error: "exclamation-triangle",
      success: "check-circle",
      info: "info-circle",
    }

    const titleMap = {
      error: "Atenção",
      success: "Sucesso!",
      info: "Informação",
    }

    alertModal.innerHTML = `
      <div class="modal-content alert-content">
        <div class="modal-header ${type}-header">
          <div class="alert-header-icon">
            <i class="fas fa-${iconMap[type]}"></i>
          </div>
          <h2>${titleMap[type]}</h2>
        </div>
        <div class="modal-body alert-body">
          <p>${message}</p>
          <button class="alert-btn ${type}-btn" onclick="this.closest('.modal').remove()">
            <i class="fas fa-check"></i>
            ENTENDI
          </button>
        </div>
      </div>
    `
    document.body.appendChild(alertModal)

    const timeout = type === "error" ? 6000 : 4000
    setTimeout(() => {
      if (alertModal.parentNode) {
        alertModal.style.opacity = "0"
        setTimeout(() => alertModal.remove(), 300)
      }
    }, timeout)

    return alertModal
  }

  // Verificação de acesso
  const userPhoneStorage = getStorage("userPhone")
  const formattedPhone = getStorage("formattedPhone")
  const tempUserData = getStorage("tempUserData")
  const accessAllowed = getStorage("accessAllowed")
  const registrationStep = getStorage("registrationStep")
  const adminAccess = getStorage("adminAccess")
  const numeroConfirmado = getStorage("numeroConfirmado")

  console.log("Verificação - Dados encontrados:", {
    userPhone: userPhoneStorage,
    formattedPhone,
    tempUserData: !!tempUserData,
    accessAllowed,
    registrationStep,
    adminAccess,
    numeroConfirmado,
  })

  // Verificação de acesso - permitir admin bypass
  if (!userPhoneStorage && !tempUserData && !accessAllowed && !adminAccess) {
    console.log("Acesso negado - redirecionando")
    showCustomAlert("Acesso negado. Você precisa fazer o cadastro primeiro para acessar esta página.", "error")
    setTimeout(() => {
      window.location.href = "index.html"
    }, 3000)
    return
  }

  // Recuperar dados do usuário
  let userData = {}
  if (tempUserData) {
    try {
      userData = JSON.parse(tempUserData)
    } catch (e) {
      console.error("Erro ao parsear dados do usuário:", e)
      userData = {
        fullName: "Usuário",
        email: "usuario@exemplo.com",
        phone: formattedPhone || "(11) 99999-9999",
      }
    }
  } else if (userPhoneStorage) {
    userData = {
      fullName: "Usuário",
      email: "usuario@exemplo.com",
      phone: formattedPhone || formatPhone(userPhoneStorage),
    }
  }

  // Verificar se é admin
  const isAdmin = userData.isAdmin || adminAccess

  // Formatar número de telefone
  function formatPhone(value) {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      if (numbers.length <= 2) {
        return `(${numbers}`
      } else if (numbers.length <= 7) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
      } else {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
      }
    }
    return value
  }

  // Elementos DOM
  const userNameElement = document.getElementById("userName")
  const userPhoneElement = document.getElementById("userPhone")
  const phoneDisplay = document.getElementById("phoneDisplay")
  const verificationForm = document.getElementById("verificationForm")
  const verifyBtn = document.getElementById("verifyBtn")
  const resendBtn = document.getElementById("resendBtn")
  const countdownElement = document.getElementById("countdown")
  const expirationElement = document.getElementById("expirationTime")
  const verificationCodeInput = document.getElementById("verificationCode")

  // Preencher dados do usuário
  if (userData.fullName) {
    const firstName = userData.fullName.split(" ")[0].toLowerCase()
    if (userNameElement) userNameElement.textContent = firstName
  }

  if (userData.phone) {
    if (userPhoneElement) userPhoneElement.textContent = userData.phone
    if (phoneDisplay) phoneDisplay.textContent = userData.phone
  }

  // Configurar input de código
  if (verificationCodeInput) {
    verificationCodeInput.addEventListener("input", (e) => {
      // Permitir apenas números
      const value = e.target.value.replace(/\D/g, "")
      e.target.value = value.substring(0, 6)

      // Habilitar botão quando tiver 6 dígitos
      if (verifyBtn) {
        verifyBtn.disabled = value.length !== 6
        verifyBtn.classList.toggle("ready", value.length === 6)
      }
    })
  }

  // Iniciar contadores apenas se não for admin
  let resendCountdown = 60 // Reduzido para teste: 1 minuto para reenvio
  let expirationCountdown = 120 // Reduzido para teste: 2 minutos para expiração total

  function startCountdowns() {
    if (isAdmin) {
      // Para admin, mostrar que não há limitações
      if (countdownElement) {
        countdownElement.textContent = "∞"
      }
      if (expirationElement) {
        expirationElement.textContent = "∞:∞"
      }
      if (resendBtn) {
        resendBtn.disabled = false
        resendBtn.innerHTML = '<i class="fas fa-redo"></i> Reenviar código'
      }
      return
    }

    // Contador para reenvio
    const resendInterval = setInterval(() => {
      resendCountdown--

      if (countdownElement) {
        countdownElement.textContent = resendCountdown
      }

      if (resendCountdown <= 0) {
        clearInterval(resendInterval)
        if (resendBtn) {
          resendBtn.disabled = false
          resendBtn.innerHTML = '<i class="fas fa-redo"></i> Reenviar código'
        }
      }
    }, 1000)

    // Contador para expiração
    const expirationInterval = setInterval(() => {
      expirationCountdown--

      if (expirationElement) {
        const minutes = Math.floor(expirationCountdown / 60)
        const seconds = expirationCountdown % 60
        expirationElement.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`
      }

      if (expirationCountdown <= 0) {
        clearInterval(expirationInterval)
        showExpirationModal()
      }
    }, 1000)
  }

  // Iniciar contadores quando a página carregar
  startCountdowns()

  // Verificar código - VERSÃO DE TESTE SEM WEBHOOK
  if (verificationForm) {
    verificationForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const code = verificationCodeInput.value.trim()

      // Para admin, aceitar qualquer código de 6 dígitos
      if (isAdmin) {
        if (code.length === 6) {
          setStorage("phoneVerified", "true")
          setStorage("registrationStep", "completed")
          setStorage("accessGranted", "true")
          showSuccessModal()
          return
        } else {
          showCustomAlert("Digite um código de 6 dígitos (qualquer código para admin).", "info")
          return
        }
      }

      if (code.length !== 6 || !/^\d+$/.test(code)) {
        showCustomAlert("Por favor, digite o código completo de 6 dígitos.", "error")
        return
      }

      console.log("Verificando código:", code)

      const originalText = verifyBtn.innerHTML
      verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...'
      verifyBtn.disabled = true

      try {
        // Simular verificação (2 segundos)
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // MODO DE TESTE: Sempre validar com sucesso
        // Código de teste válido: qualquer código de 6 dígitos
        setStorage("phoneVerified", "true")
        setStorage("registrationStep", "completed")
        setStorage("accessGranted", "true")
        showSuccessModal()
      } catch (error) {
        console.error("Erro na verificação:", error)
        showCustomAlert("Erro de conexão. Tente novamente.", "error")
        resetVerifyBtn()
      }
    })
  }

  function resetVerifyBtn() {
    if (verifyBtn) {
      verifyBtn.disabled = false
      verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i> CONFIRMAR CÓDIGO'
    }
  }

  // Reenviar código - VERSÃO DE TESTE SEM WEBHOOK
  if (resendBtn) {
    resendBtn.addEventListener("click", async () => {
      if (resendBtn.disabled && !isAdmin) return

      const originalText = resendBtn.innerHTML
      resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Reenviando...'
      resendBtn.disabled = true

      try {
        // Simular reenvio (1.5 segundos)
        await new Promise((resolve) => setTimeout(resolve, 1500))

        showCustomAlert("Código reenviado com sucesso!", "success")

        if (!isAdmin) {
          // Reiniciar contador de reenvio apenas para usuários normais
          resendCountdown = 60 // Reduzido para teste
          if (countdownElement) {
            countdownElement.textContent = resendCountdown
          }

          resendBtn.innerHTML = '<i class="fas fa-redo"></i> Reenviar em <span id="countdown">60</span>s'

          // Reiniciar contador de expiração
          expirationCountdown = 120 // Reduzido para teste

          // Atualizar elemento de contagem
          const newCountdownElement = document.getElementById("countdown")
          if (newCountdownElement) {
            newCountdownElement.textContent = resendCountdown
          }
        } else {
          // Para admin, manter sempre disponível
          resendBtn.innerHTML = '<i class="fas fa-redo"></i> Reenviar código'
          resendBtn.disabled = false
        }
      } catch (error) {
        console.error("Erro ao reenviar código:", error)
        showCustomAlert("Erro ao reenviar código. Tente novamente.", "error")
        resendBtn.innerHTML = originalText
        resendBtn.disabled = false
      }
    })
  }

  // Função para mostrar modal de sucesso
  function showSuccessModal() {
    const successModal = document.createElement("div")
    successModal.className = "modal"
    successModal.style.display = "flex"
    successModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-body success-modal-body">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h2>Verificação Concluída!</h2>
          <p>Seu telefone foi verificado com sucesso.</p>
          <p>Bem-vindo ao OnlyFlix Premium!</p>
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
          <p style="margin-top: 20px; font-size: 14px; opacity: 0.8;">
            Redirecionando para seu dashboard...
          </p>
        </div>
      </div>
    `
    document.body.appendChild(successModal)

    setTimeout(() => {
      successModal.remove()
      window.location.href = "dashboard.html"
    }, 3000) // Reduzido para teste
  }

  // Função para mostrar modal de expiração
  function showExpirationModal() {
    if (isAdmin) return // Admin não tem expiração

    const expirationModal = document.createElement("div")
    expirationModal.className = "modal expiration-modal"
    expirationModal.style.display = "flex"
    expirationModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header error-header">
          <div class="alert-header-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h2>Tempo Expirado</h2>
        </div>
        <div class="modal-body alert-body">
          <p>O tempo para verificação do seu número expirou.</p>
          <p>Por favor, inicie o processo novamente.</p>
          <button class="alert-btn error-btn" id="restartBtn">
            <i class="fas fa-redo"></i>
            TENTAR NOVAMENTE
          </button>
        </div>
      </div>
    `
    document.body.appendChild(expirationModal)

    // Botão para reiniciar o processo
    const restartBtn = document.getElementById("restartBtn")
    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        window.location.href = "index.html"
      })
    }
  }

  // Debug
  console.log("Página de verificação carregada com dados:", userData)
  console.log("É admin:", isAdmin)
})
