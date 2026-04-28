document.querySelectorAll('.otp-input').forEach((input, index, inputs) => {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(-1);
    if (input.value.length >= 1) {
      input.classList.add('filled');
      if (inputs[index + 1]) inputs[index + 1].focus();
    }
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Backspace' && !input.value && inputs[index - 1]) {
      inputs[index - 1].focus();
      inputs[index - 1].value = '';
      inputs[index - 1].classList.remove('filled');
    }
  });

  input.addEventListener('paste', (event) => {
    event.preventDefault();
    const digits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    digits.split('').forEach((digit, offset) => {
      const target = inputs[index + offset];
      if (target) {
        target.value = digit;
        target.classList.add('filled');
      }
    });

    const next = inputs[Math.min(index + digits.length, inputs.length - 1)];
    if (next) next.focus();
  });
});

let challengeId = null;

function setButtonState(id, text, disabled) {
  const button = document.getElementById(id);
  if (!button) return;
  button.textContent = text;
  button.disabled = disabled;
}

function showError(id, message) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = message;
  element.style.display = message ? 'block' : 'none';
}

function showOtpStep(email) {
  document.getElementById('otp-section').style.display = '';
  document.getElementById('otp-email-label').textContent = email;
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('otp-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('otp-0').focus();
}

function resetToForms() {
  challengeId = null;
  document.getElementById('otp-section').style.display = 'none';
  document.getElementById('auth-section').style.display = '';
  document.querySelectorAll('.otp-input').forEach((input) => {
    input.value = '';
    input.classList.remove('filled');
  });
  showError('otp-error', '');
}

function isMediaRole(role) {
  return role === 'ARTIST' || role === 'DJ';
}

async function requestOtp(identifier, password) {
  const response = await fetch('/api/auth/otp/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to send code.');
  }

  return data;
}

async function handleSignUp() {
  const email = document.getElementById('su-email').value.trim();
  const username = document.getElementById('su-username').value.trim();
  const role = document.getElementById('su-role').value;
  const password = document.getElementById('su-password').value;
  const acceptedPolicy = document.getElementById('su-age-policy').checked;

  showError('su-error', '');

  if (!email || !username || !role || !password) {
    showError('su-error', 'Please fill in all fields.');
    return;
  }

  if (!acceptedPolicy) {
    showError('su-error', 'Please confirm the age and content attestation.');
    return;
  }

  setButtonState('su-btn', 'Creating account...', true);

  try {
    const registerResponse = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        username,
        password,
        role,
        isThirteenOrOlder: acceptedPolicy,
        acceptedArtistUploadPolicy: isMediaRole(role) ? acceptedPolicy : false
      })
    });
    const registerData = await registerResponse.json();

    if (!registerResponse.ok) {
      throw new Error(registerData.error || 'Registration failed.');
    }

    const data = await requestOtp(email, password);
    challengeId = data.challengeId;
    showOtpStep(data.email);
  } catch (error) {
    showError('su-error', error instanceof Error ? error.message : 'Registration failed.');
  } finally {
    setButtonState('su-btn', 'Create account and send code', false);
  }
}

async function handleSignIn() {
  const identifier = document.getElementById('si-identifier').value.trim();
  const password = document.getElementById('si-password').value;

  showError('si-error', '');

  if (!identifier || !password) {
    showError('si-error', 'Please fill in all fields.');
    return;
  }

  setButtonState('si-btn', 'Sending code...', true);

  try {
    const data = await requestOtp(identifier, password);
    challengeId = data.challengeId;
    showOtpStep(data.email);
  } catch (error) {
    showError('si-error', error instanceof Error ? error.message : 'Failed to send code.');
  } finally {
    setButtonState('si-btn', 'Send my code', false);
  }
}

async function handleVerify() {
  const otp = [0, 1, 2, 3, 4, 5].map((index) => document.getElementById(`otp-${index}`).value).join('');

  showError('otp-error', '');

  if (otp.length < 6) {
    showError('otp-error', 'Enter all 6 digits.');
    return;
  }

  if (!challengeId) {
    showError('otp-error', 'Session expired. Please go back and try again.');
    return;
  }

  setButtonState('otp-btn', 'Verifying...', true);

  try {
    const response = await fetch('/api/auth/otp/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, otp })
    });
    const data = await response.json();

    if (!response.ok) {
      showError('otp-error', data.error || 'Something went wrong. Please try again.');
      setButtonState('otp-btn', 'Verify and continue', false);
      return;
    }

    window.location.href = data.redirect || '/auth/landing';
  } catch {
    showError('otp-error', 'Something went wrong. Please try again.');
    setButtonState('otp-btn', 'Verify and continue', false);
  }
}

function showInitialAuthErrors() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');

  if (error === 'CredentialsSignin') {
    showError('si-error', 'Incorrect code or it expired. Enter your password again to get a new code.');
  } else if (error) {
    showError('si-error', `Sign-in error: ${error}. Please try again.`);
  }
}

document.getElementById('su-password')?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') handleSignUp();
});
document.getElementById('si-password')?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') handleSignIn();
});
document.getElementById('otp-5')?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') handleVerify();
});
document.getElementById('su-btn')?.addEventListener('click', handleSignUp);
document.getElementById('si-btn')?.addEventListener('click', handleSignIn);
document.getElementById('otp-btn')?.addEventListener('click', handleVerify);
document.getElementById('otp-back')?.addEventListener('click', (event) => {
  event.preventDefault();
  resetToForms();
});

showInitialAuthErrors();
