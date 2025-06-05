document.addEventListener("DOMContentLoaded", () => {
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
  const codeInputs = document.querySelectorAll(".code-digit")
  const verificationCodeInput = document.getElementById("verificationCode")

  // Buscar elemento de expiração de forma mais robusta
  let expirationElement = document.getElementById("expirationTimer")
  if (!expirationElement) {
    // Tentar outras possíveis IDs ou classes
    expirationElement = document.querySelector(".expiration-timer")
    if (!expirationElement) {
      expirationElement = document.querySelector("[data-timer='expiration']")
    }
  }

  console.log("Elementos encontrados:", {
    expirationElement: !!expirationElement,
    countdownElement: !!countdownElement,
    expirationElementId: expirationElement?.id,
    expirationElementClass: expirationElement?.className,
  })

  // Preencher dados do usuário
  if (userData.fullName) {
    const firstName = userData.fullName.split(" ")[0].toLowerCase()
    if (userNameElement) userNameElement.textContent = firstName
  }

  if (userData.phone) {
    if (userPhoneElement) userPhoneElement.textContent = userData.phone
    if (phoneDisplay) phoneDisplay.textContent = userData.phone
  }

  // Configurar inputs de código
  codeInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      // Permitir apenas números
      if (!/^\d$/.test(e.target.value)) {
        e.target.value = ""
        return
      }

      // Mover para o próximo input
      if (index < codeInputs.length - 1) {
        codeInputs[index + 1].focus()
      }

      checkCodeComplete()
    })

    input.addEventListener("keydown", (e) => {
      // Backspace - voltar para input anterior
      if (e.key === "Backspace" && !input.value && index > 0) {
        codeInputs[index - 1].focus()
      }
    })

    input.addEventListener("paste", (e) => {
      e.preventDefault()
      const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
      pastedData.split("").forEach((digit, i) => {
        if (codeInputs[i]) {
          codeInputs[i].value = digit
        }
      })
      checkCodeComplete()
    })
  })

  function checkCodeComplete() {
    const code = [...codeInputs].map((input) => input.value).join("")
    if (verifyBtn) {
      verifyBtn.disabled = code.length !== 6
      verifyBtn.classList.toggle("ready", code.length === 6)
    }
  }

  // Iniciar contadores apenas se não for admin
  let resendCountdown = 60 // 2 minutos para reenvio
  let expirationCountdown = 240 // 4 minutos para expiração total
  let resendInterval = null
  let expirationInterval = null

  function updateExpirationDisplay(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    const timeString = `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`

    console.log("Atualizando timer:", timeString, "Segundos restantes:", seconds)

    // Tentar múltiplas formas de atualizar o elemento
    if (expirationElement) {
      expirationElement.textContent = timeString
      expirationElement.innerText = timeString
    }

    // Buscar novamente o elemento caso tenha sido recriado
    const timerElement = document.getElementById("expirationTimer")
    if (timerElement) {
      timerElement.textContent = timeString
      timerElement.innerText = timeString
    }

    // Buscar por classe também
    const timerByClass = document.querySelector(".expiration-timer")
    if (timerByClass) {
      timerByClass.textContent = timeString
      timerByClass.innerText = timeString
    }

    // Buscar todos os elementos que podem conter o timer
    const allTimerElements = document.querySelectorAll("[id*='timer'], [class*='timer'], [data-timer]")
    allTimerElements.forEach((el) => {
      if (el.textContent.includes(":") || el.textContent.includes("4:00")) {
        el.textContent = timeString
      }
    })
  }

  function startCountdowns() {
    console.log("Iniciando contadores. É admin:", isAdmin)

    if (isAdmin) {
      // Para admin, mostrar que não há limitações
      if (countdownElement) {
        countdownElement.textContent = "∞"
      }
      updateExpirationDisplay("∞:∞")
      if (resendBtn) {
        resendBtn.disabled = false
        resendBtn.innerHTML = '<i class="fas fa-redo"></i> Reenviar código'
      }
      return
    }

    // Limpar intervalos existentes
    if (resendInterval) {
      clearInterval(resendInterval)
      resendInterval = null
    }
    if (expirationInterval) {
      clearInterval(expirationInterval)
      expirationInterval = null
    }

    console.log("Iniciando timer de expiração com", expirationCountdown, "segundos")

    // Atualizar display inicial
    updateExpirationDisplay(expirationCountdown)

    // Contador para reenvio
    resendInterval = setInterval(() => {
      resendCountdown--
      console.log("Reenvio countdown:", resendCountdown)

      if (countdownElement) {
        countdownElement.textContent = resendCountdown
      }

      if (resendCountdown <= 0) {
        clearInterval(resendInterval)
        resendInterval = null
        if (resendBtn) {
          resendBtn.disabled = false
          resendBtn.innerHTML = '<i class="fas fa-redo"></i> Reenviar código'
        }
      }
    }, 1000)

    // Contador para expiração
    expirationInterval = setInterval(() => {
      expirationCountdown--
      console.log("Expiração countdown:", expirationCountdown)

      updateExpirationDisplay(expirationCountdown)

      if (expirationCountdown <= 0) {
        clearInterval(expirationInterval)
        expirationInterval = null
        console.log("Timer expirado - mostrando modal")
        showExpirationModal()
      }
    }, 1000)
  }

  // Aguardar um pouco para garantir que todos os elementos estão carregados
  setTimeout(() => {
    console.log("Iniciando contadores após delay")
    startCountdowns()
  }, 500)

  // Verificar código
  if (verificationForm) {
    verificationForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const code = verificationCodeInput ? verificationCodeInput.value.trim() : ""

      // Para admin, aceitar qualquer código de 6 dígitos
      if (isAdmin) {
        if (code.length === 6 && /^\d+$/.test(code)) {
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
        const numero = numeroConfirmado || userData.phone?.replace(/\D/g, "")

        const response = await fetch(
          "https://main-n8n.ohbhf7.easypanel.host/webhook/por-codigo",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ numero: `+55${numero}`, code }),
          }
        )

        let data = null
        try {
          data = await response.json()
        } catch {
          console.error("Resposta inválida:", await response.text())
          showCustomAlert("Erro de conexão. Tente novamente.", "error")
          resetVerifyBtn()
          return
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        if (data.validado === true) {
          setStorage("phoneVerified", "true")
          setStorage("registrationStep", "completed")
          setStorage("accessGranted", "true")
          showSuccessModal()
        } else {
          showCustomAlert("Código inválido ou expirado.", "error")
          resetVerifyBtn()
        }

        // Simulação temporária - remover quando implementar webhooks
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Por enquanto, aceitar qualquer código válido de 6 dígitos
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
      verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i> VERIFICAR CÓDIGO'
    }
  }

  // Reenviar código
  if (resendBtn) {
    resendBtn.addEventListener("click", async () => {
      if (resendBtn.disabled && !isAdmin) return

      const originalText = resendBtn.innerHTML
      resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Reenviando...'
      resendBtn.disabled = true

      try {
        const numero = numeroConfirmado || userData.phone?.replace(/\D/g, "")

        await fetch(
          "https://main-n8n.ohbhf7.easypanel.host/webhook/resend-code",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ numero }),
          }
        )

        await new Promise((resolve) => setTimeout(resolve, 1500))

        showCustomAlert("Código reenviado com sucesso!", "success")

        if (!isAdmin) {
          // Reiniciar contadores
          resendCountdown = 60
          expirationCountdown = 240

          // Reiniciar os timers
          startCountdowns()

          resendBtn.innerHTML = '<i class="fas fa-redo"></i> Reenviar em <span id="countdown">60</span>s'
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
    // Limpar timers quando bem-sucedido
    if (resendInterval) clearInterval(resendInterval)
    if (expirationInterval) clearInterval(expirationInterval)

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
    }, 4000)
  }

  // Função para mostrar modal de expiração
  function showExpirationModal() {
    if (isAdmin) return // Admin não tem expiração

    // Limpar timers
    if (resendInterval) clearInterval(resendInterval)
    if (expirationInterval) clearInterval(expirationInterval)

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
