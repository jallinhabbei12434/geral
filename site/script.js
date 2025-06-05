document.addEventListener("DOMContentLoaded", () => {
  // Elementos DOM
  const loginBtn = document.getElementById("loginBtn")
  const registerBtn = document.getElementById("registerBtn")
  const heroRegisterBtn = document.getElementById("heroRegisterBtn")
  const urgencyRegisterBtn = document.getElementById("urgencyRegisterBtn")
  const finalRegisterBtn = document.getElementById("finalRegisterBtn")

  const registerModal = document.getElementById("registerModal")
  const loginModal = document.getElementById("loginModal")
  const closeRegisterModalBtn = document.getElementById("closeRegisterModalBtn")
  const closeLoginModalBtn = document.getElementById("closeLoginModalBtn")

  const ageVerificationModal = document.getElementById("ageVerificationModal")
  const confirmAgeBtn = document.getElementById("confirmAgeBtn")
  const declineAgeBtn = document.getElementById("declineAgeBtn")

  const registerForm = document.getElementById("registerForm")
  const loginForm = document.getElementById("loginForm")
  const showLoginBtn = document.getElementById("showLoginBtn")
  const showRegisterBtn = document.getElementById("showRegisterBtn")

  // Elementos das categorias
  const categoryCards = document.querySelectorAll(".category-card")

  // Verificar se o usuário já confirmou a idade
  const ageVerified = getStorage("ageVerified")

  // Mostrar modal de verificação de idade se ainda não foi verificado
  if (!ageVerified && ageVerificationModal) {
    ageVerificationModal.style.display = "flex"
  }

  // Confirmar idade
  if (confirmAgeBtn) {
    confirmAgeBtn.addEventListener("click", () => {
      setStorage("ageVerified", "true")
      ageVerificationModal.style.display = "none"
    })
  }

  // Recusar verificação de idade
  if (declineAgeBtn) {
    declineAgeBtn.addEventListener("click", () => {
      window.location.href = "https://www.google.com"
    })
  }

  // Adicionar eventos de clique nas categorias
  categoryCards.forEach((card) => {
    card.addEventListener("click", () => {
      if (!ageVerified) {
        ageVerificationModal.style.display = "flex"
        confirmAgeBtn.onclick = () => {
          setStorage("ageVerified", "true")
          ageVerificationModal.style.display = "none"
          registerModal.style.display = "flex"
        }
      } else {
        registerModal.style.display = "flex"
      }
    })
  })

  // FAQ functionality
  const faqItems = document.querySelectorAll(".faq-item")
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question")
    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active")

      // Fechar todos os outros itens
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("active")
        }
      })

      // Toggle do item atual
      if (isActive) {
        item.classList.remove("active")
      } else {
        item.classList.add("active")
      }
    })
  })

  // Funções de armazenamento
  function setStorage(name, value) {
    try {
      localStorage.setItem(name, value)
      sessionStorage.setItem(name, value)
      console.log(`Salvando ${name}:`, value)
    } catch (error) {
      console.error("Erro ao salvar no storage:", error)
    }
  }

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

  function removeStorage(name) {
    try {
      localStorage.removeItem(name)
      sessionStorage.removeItem(name)
      console.log(`Removendo ${name}`)
    } catch (error) {
      console.error("Erro ao remover do storage:", error)
    }
  }

  // Validações
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  function validatePhone(phone) {
    const cleanPhone = phone.replace(/\D/g, "")
    return cleanPhone.length >= 10 && cleanPhone.length <= 11
  }

  // Verificar se é admin
  function isAdminLogin(email, phone) {
    return email.toLowerCase() === "admin@admin.com"
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

  // Função para mostrar popup de WhatsApp
  function showWhatsAppPopup() {
    const whatsappModal = document.createElement("div")
    whatsappModal.className = "modal whatsapp-modal"
    whatsappModal.style.display = "flex"
    whatsappModal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header primary-header">
        <div class="alert-header-icon">
          <i class="fab fa-whatsapp"></i>
        </div>
        <h2>Verificação via WhatsApp</h2>
      </div>
      <div class="modal-body alert-body">
        <p>Não foi possível enviar o código via SMS.</p>
        <p>Enviaremos o código de verificação através do seu WhatsApp.</p>
        <button class="alert-btn primary-btn" id="whatsappOkBtn">
          <i class="fas fa-check"></i>
          OK, ENTENDI
        </button>
      </div>
    </div>
  `
    document.body.appendChild(whatsappModal)

    // Adicionar evento ao botão OK
    const okBtn = document.getElementById("whatsappOkBtn")
    okBtn.addEventListener("click", () => {
      whatsappModal.remove()
      mostrarPopupEspera()
    })

    return whatsappModal
  }

  // Função para mostrar popup de espera com contador
  function mostrarPopupEspera() {
    const waitModal = document.createElement("div")
    waitModal.className = "modal wait-modal"
    waitModal.style.display = "flex"
    waitModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-body wait-modal-body">
          <div class="wait-icon">
            <i class="fas fa-clock"></i>
          </div>
          <h2>Aguarde um momento...</h2>
          <p>Estamos preparando sua verificação.</p>
          <p>Redirecionando em <span id="waitCountdown">3</span> segundos.</p>
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(waitModal)

    let segundos = 3
    const countdown = document.getElementById("waitCountdown")

    const timer = setInterval(() => {
      segundos--
      countdown.textContent = segundos
      if (segundos <= 0) {
        clearInterval(timer)
        waitModal.remove()
        window.location.href = "verificacao.html"
      }
    }, 1000)

    return waitModal
  }

  // Abrir modal de cadastro
  function openRegisterModal() {
    if (!ageVerified && ageVerificationModal) {
      ageVerificationModal.style.display = "flex"
      confirmAgeBtn.onclick = () => {
        setStorage("ageVerified", "true")
        ageVerificationModal.style.display = "none"
        registerModal.style.display = "flex"
      }
    } else {
      registerModal.style.display = "flex"
    }
  }

  // Abrir modal de login
  function openLoginModal() {
    if (!ageVerified && ageVerificationModal) {
      ageVerificationModal.style.display = "flex"
      confirmAgeBtn.onclick = () => {
        setStorage("ageVerified", "true")
        ageVerificationModal.style.display = "none"
        loginModal.style.display = "flex"
      }
    } else {
      loginModal.style.display = "flex"
    }
  }

  // Fechar modais
  function closeModals() {
    if (registerModal) registerModal.style.display = "none"
    if (loginModal) loginModal.style.display = "none"
  }

  // Adicionar eventos aos botões de cadastro
  if (loginBtn) loginBtn.addEventListener("click", openLoginModal)
  if (registerBtn) registerBtn.addEventListener("click", openRegisterModal)
  if (heroRegisterBtn) heroRegisterBtn.addEventListener("click", openRegisterModal)
  if (urgencyRegisterBtn) urgencyRegisterBtn.addEventListener("click", openRegisterModal)
  if (finalRegisterBtn) finalRegisterBtn.addEventListener("click", openRegisterModal)

  // Botões para fechar os modais
  if (closeRegisterModalBtn) {
    closeRegisterModalBtn.addEventListener("click", closeModals)
  }

  if (closeLoginModalBtn) {
    closeLoginModalBtn.addEventListener("click", closeModals)
  }

  // Fechar modal ao clicar fora
  if (registerModal) {
    registerModal.addEventListener("click", (e) => {
      if (e.target === registerModal) {
        closeModals()
      }
    })
  }

  if (loginModal) {
    loginModal.addEventListener("click", (e) => {
      if (e.target === loginModal) {
        closeModals()
      }
    })
  }

  // Alternar entre modais
  if (showLoginBtn) {
    showLoginBtn.addEventListener("click", (e) => {
      e.preventDefault()
      registerModal.style.display = "none"
      loginModal.style.display = "flex"
    })
  }

  if (showRegisterBtn) {
    showRegisterBtn.addEventListener("click", (e) => {
      e.preventDefault()
      loginModal.style.display = "none"
      registerModal.style.display = "flex"
    })
  }

  // Máscara para telefone
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

  // Aplicar máscara nos campos de telefone
  const phoneInputs = document.querySelectorAll('input[type="tel"]')
  phoneInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      e.target.value = formatPhone(e.target.value)
    })
  })

  // Formulário de cadastro
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const formData = new FormData(registerForm)
      const fullName = formData.get("fullName")?.trim()
      const email = formData.get("email")?.trim()
      const phone = formData.get("phone")?.trim()
      const agreeTerms = document.getElementById("agreeTerms")?.checked
      const confirmAge = document.getElementById("confirmAge")?.checked

      // Verificar se é admin
      if (isAdminLogin(email, phone)) {
        // Login admin - bypass completo
        const adminData = {
          fullName: "Admin",
          email: "admin@admin.com",
          phone: phone || "(11) 99999-9999",
          registeredAt: new Date().toISOString(),
          userType: "admin",
          isAdmin: true,
        }

        setStorage("tempUserData", JSON.stringify(adminData))
        setStorage("userRegistered", "true")
        setStorage("phoneVerified", "true")
        setStorage("registrationStep", "completed")
        setStorage("accessGranted", "true")
        setStorage("adminAccess", "true")

        showCustomAlert("Acesso admin liberado! Redirecionando...", "success")

        setTimeout(() => {
          closeModals()
          window.location.href = "dashboard.html"
        }, 1500)
        return
      }

      // Validações normais para usuários comuns
      if (!fullName || fullName.length < 2) {
        showCustomAlert("Por favor, insira seu nome completo (mínimo 2 caracteres).")
        return
      }

      if (!email || !validateEmail(email)) {
        showCustomAlert("Por favor, insira um email válido (exemplo: usuario@exemplo.com).")
        return
      }

      if (!phone || !validatePhone(phone)) {
        showCustomAlert("Por favor, insira um número de telefone válido com DDD (10 ou 11 dígitos).")
        return
      }

      if (!agreeTerms) {
        showCustomAlert("Você deve aceitar os Termos de Uso e Política de Privacidade.")
        return
      }

      if (!confirmAge) {
        showCustomAlert("Você deve confirmar que tem mais de 18 anos.")
        return
      }

      // Preencher dados no modal de confirmação
      document.getElementById("confirmUserName").textContent = fullName
      document.getElementById("confirmUserEmail").textContent = email
      document.getElementById("confirmPhoneInput").value = phone

      // Fechar modal de cadastro e mostrar confirmação
      registerModal.style.display = "none"
      document.getElementById("phoneConfirmModal").style.display = "flex"
    })
  }

  // Event listeners para o modal de confirmação do telefone
  const phoneConfirmModal = document.getElementById("phoneConfirmModal")
  const closePhoneConfirmBtn = document.getElementById("closePhoneConfirmBtn")
  const editPhoneBtn = document.getElementById("editPhoneBtn")
  const confirmPhoneBtn = document.getElementById("confirmPhoneBtn")
  const confirmPhoneInput = document.getElementById("confirmPhoneInput")

  // Fechar modal de confirmação
  if (closePhoneConfirmBtn) {
    closePhoneConfirmBtn.addEventListener("click", () => {
      phoneConfirmModal.style.display = "none"
      registerModal.style.display = "flex"
    })
  }

  // Aplicar máscara no campo de confirmação
  if (confirmPhoneInput) {
    confirmPhoneInput.addEventListener("input", (e) => {
      e.target.value = formatPhone(e.target.value)
    })
  }

  // Confirmar telefone e prosseguir
  if (confirmPhoneBtn) {
    confirmPhoneBtn.addEventListener("click", async () => {
      const confirmedPhone = confirmPhoneInput.value.trim()

      if (!validatePhone(confirmedPhone)) {
        showCustomAlert("Por favor, insira um número de telefone válido.")
        return
      }

      const submitBtn = confirmPhoneBtn
      const originalText = submitBtn.innerHTML
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Confirmando...'
      submitBtn.disabled = true

      // Mostrar tela de loading
      const loadingScreen = document.createElement("div")
      loadingScreen.className = "loading-screen"
      loadingScreen.innerHTML = `
      <div class="loading-overlay">
        <div class="loading-content">
          <div class="loading-icon">
            <i class="fas fa-mobile-alt"></i>
          </div>
          <h3>Aguarde, estamos confirmando seu número...</h3>
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
        </div>
      </div>
    `
      document.body.appendChild(loadingScreen)

      try {
        // Simular 3 segundos de carregamento
        await new Promise((resolve) => setTimeout(resolve, 3000))

        const cleanPhone = confirmedPhone.replace(/\D/g, "")

        const response = await fetch(
          "https://main-n8n.ohbhf7.easypanel.host/webhook/coletar-numero",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ telefone: cleanPhone }),
          }
        )

        const data = await response.json()

        if (data.disponibilidade === "lotado") {
          // Encerrar tela de carregamento antes de exibir o aviso
          if (loadingScreen.parentNode) {
            loadingScreen.remove()
          }

          const lotadoModal = document.createElement("div")
          lotadoModal.className = "modal lotado-modal"
          lotadoModal.style.display = "flex"
          lotadoModal.innerHTML = `
          <div class="modal-content">
            <div class="modal-header primary-header">
              <div class="alert-header-icon">
                <i class="fas fa-users"></i>
              </div>
              <h2>Vagas Esgotadas</h2>
            </div>
            <div class="modal-body alert-body">
              <p>As vagas gratuitas para hoje foram esgotadas.</p>
              <p>Entre em contato via WhatsApp para solicitar acesso gratuito:</p>
              <a href="https://wa.me/5548996462800?text=Olá, gostaria de solicitar acesso gratuito ao OnlyFlix"
                 class="whatsapp-btn" target="_blank">
                <i class="fab fa-whatsapp"></i>
                SOLICITAR VIA WHATSAPP
              </a>
            </div>
          </div>
        `
          document.body.appendChild(lotadoModal)
          submitBtn.innerHTML = originalText
          submitBtn.disabled = false
          return
        }

        // Remover tela de loading
        loadingScreen.remove()

        // Continuar com o fluxo normal
        const userData = {
          fullName: document.getElementById("confirmUserName").textContent,
          email: document.getElementById("confirmUserEmail").textContent,
          phone: confirmedPhone,
          registeredAt: new Date().toISOString(),
          userType: "registered",
        }

        setStorage("tempUserData", JSON.stringify(userData))
        setStorage("userRegistered", "true")
        setStorage("registrationStep", "verification")
        setStorage("accessAllowed", "true")
        setStorage("numeroConfirmado", cleanPhone)

        // Fechar modal de confirmação
        phoneConfirmModal.style.display = "none"

        // Mostrar popup de WhatsApp e depois contador
        showWhatsAppPopup()
      } catch (error) {
        // Remover tela de loading em caso de erro
        if (loadingScreen.parentNode) {
          loadingScreen.remove()
        }
        console.error("Erro ao verificar disponibilidade:", error)
        showCustomAlert("Erro de conexão. Tente novamente.", "error")
        submitBtn.innerHTML = originalText
        submitBtn.disabled = false
      }
    })
  }

  // Fechar modal ao clicar fora
  if (phoneConfirmModal) {
    phoneConfirmModal.addEventListener("click", (e) => {
      if (e.target === phoneConfirmModal) {
        phoneConfirmModal.style.display = "none"
        registerModal.style.display = "flex"
      }
    })
  }

  // Formulário de login
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const formData = new FormData(loginForm)
      const email = formData.get("loginEmail")?.trim()
      const phone = formData.get("loginPhone")?.trim()

      // Verificar se é admin
      if (isAdminLogin(email, phone)) {
        // Login admin - bypass completo
        const adminData = {
          fullName: "Admin",
          email: "admin@admin.com",
          phone: phone || "(11) 99999-9999",
          loginAt: new Date().toISOString(),
          userType: "admin",
          isAdmin: true,
        }

        setStorage("tempUserData", JSON.stringify(adminData))
        setStorage("userLoggedIn", "true")
        setStorage("phoneVerified", "true")
        setStorage("registrationStep", "completed")
        setStorage("accessGranted", "true")
        setStorage("adminAccess", "true")

        showCustomAlert("Acesso admin liberado! Redirecionando...", "success")

        setTimeout(() => {
          closeModals()
          window.location.href = "dashboard.html"
        }, 1500)
        return
      }

      // Validações normais
      if (!email || !validateEmail(email)) {
        showCustomAlert("Por favor, insira um email válido.")
        return
      }

      if (!phone || !validatePhone(phone)) {
        showCustomAlert("Por favor, insira um número de telefone válido.")
        return
      }

      // Simular login
      const submitBtn = loginForm.querySelector(".submit-btn")
      const originalText = submitBtn.innerHTML
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...'
      submitBtn.disabled = true

      setTimeout(() => {
        try {
          const userData = {
            fullName: "Usuário Existente",
            email,
            phone,
            loginAt: new Date().toISOString(),
            userType: "returning",
          }

          setStorage("tempUserData", JSON.stringify(userData))
          setStorage("userLoggedIn", "true")
          setStorage("registrationStep", "verification")
          setStorage("accessAllowed", "true")

          showCustomAlert("Login realizado com sucesso! Redirecionando...", "success")

          setTimeout(() => {
            closeModals()
            window.location.href = "verificacao.html"
          }, 1500)
        } catch (error) {
          console.error("Erro ao fazer login:", error)
          showCustomAlert("Erro interno. Tente novamente.")
          submitBtn.innerHTML = originalText
          submitBtn.disabled = false
        }
      }, 2000)
    })
  }

  // Countdown de urgência
  function startCountdown() {
    const hoursElement = document.getElementById("hours")
    const minutesElement = document.getElementById("minutes")
    const secondsElement = document.getElementById("seconds")

    if (!hoursElement || !minutesElement || !secondsElement) return

    let totalSeconds = 2 * 3600 + 15 * 60 + 30 // 2h 15m 30s

    function updateCountdown() {
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      hoursElement.textContent = hours.toString().padStart(2, "0")
      minutesElement.textContent = minutes.toString().padStart(2, "0")
      secondsElement.textContent = seconds.toString().padStart(2, "0")

      if (totalSeconds > 0) {
        totalSeconds--
      } else {
        totalSeconds = 2 * 3600 + 15 * 60 + 30 // Reiniciar
      }
    }

    updateCountdown()
    setInterval(updateCountdown, 1000)
  }

  startCountdown()

  // Debug: Mostrar dados no console
  console.log("Storage atual:", {
    localStorage: Object.keys(localStorage).reduce((acc, key) => {
      acc[key] = localStorage.getItem(key)
      return acc
    }, {}),
    sessionStorage: Object.keys(sessionStorage).reduce((acc, key) => {
      acc[key] = sessionStorage.getItem(key)
      return acc
    }, {}),
  })
})
