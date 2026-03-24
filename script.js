document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('eyeIcon');
    const strengthBar = document.getElementById('strengthBar');
    const threatLevel = document.getElementById('threatLevel');
    const entropyValue = document.getElementById('entropyValue');
    const suggestionsList = document.getElementById('suggestions');

    // Password criteria definition
    const requirements = [
        { regex: /.{8,}/, id: 'LEN', message: 'MIN_LENGTH_8' },
        { regex: /[A-Z]/, id: 'UPR', message: 'UPPERCASE_CHAR' },
        { regex: /[a-z]/, id: 'LWR', message: 'LOWERCASE_CHAR' },
        { regex: /[0-9]/, id: 'NUM', message: 'NUMERIC_DIGIT' },
        { regex: /[^A-Za-z0-9]/, id: 'SPC', message: 'SPECIAL_CHAR' }
    ];

    // Initialize terminal with all requirements failing
    renderTerminalOutput('', []);

    // Typing effect for scan visualizer
    let typingTimer;
    passwordInput.addEventListener('keydown', () => {
        document.body.classList.add('typing');
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            document.body.classList.remove('typing');
        }, 800);
    });

    // Toggle Password Visibility
    togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        
        if (isPassword) {
            eyeIcon.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            `;
        } else {
            eyeIcon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            `;
        }
    });

    passwordInput.addEventListener('input', (e) => {
        const password = e.target.value;
        evaluatePasswordStrength(password);
    });

    function evaluatePasswordStrength(password) {
        if (!password) {
            strengthBar.style.width = '0%';
            strengthBar.style.backgroundColor = 'var(--red)';
            strengthBar.style.boxShadow = '0 0 10px var(--red)';
            
            threatLevel.textContent = 'CRITICAL';
            threatLevel.className = 'metric-value font-mono threat-high';
            
            entropyValue.textContent = '0.00';
            renderTerminalOutput(password, []);
            return;
        }

        let score = 0;
        let metCriteria = [];

        requirements.forEach(req => {
            if (req.regex.test(password)) {
                score++;
                metCriteria.push(req.message);
            }
        });

        // 1. Calculate pseudo-entropy purely for UI visual effect
        const charTypes = (/[a-z]/.test(password)?26:0) + 
                          (/[A-Z]/.test(password)?26:0) + 
                          (/[0-9]/.test(password)?10:0) + 
                          (/[^a-zA-Z0-9]/.test(password)?32:0);
                          
        const poolSize = Math.max(charTypes, 1);
        const entropy = (password.length * Math.log2(poolSize)).toFixed(1);
        entropyValue.textContent = entropy;

        // 2. Bar width & Color
        const progress = (score / requirements.length) * 100;
        strengthBar.style.width = `${progress}%`;

        let statusText = '';
        let colorVar = '';

        if (score <= 2) {
            statusText = 'CRITICAL';
            colorVar = 'var(--red)';
            threatLevel.className = 'metric-value font-mono threat-high';
        } else if (score <= 4) {
            statusText = 'CAUTION';
            colorVar = 'var(--yellow)';
            threatLevel.className = 'metric-value font-mono threat-med';
        } else {
            statusText = 'SECURE';
            colorVar = 'var(--green)';
            threatLevel.className = 'metric-value font-mono threat-low';
        }

        strengthBar.style.backgroundColor = colorVar;
        strengthBar.style.boxShadow = `0 0 15px ${colorVar}`;
        threatLevel.textContent = statusText;

        // 3. Update Terminal Output 
        renderTerminalOutput(password, metCriteria);
    }

    function renderTerminalOutput(password, metCriteria) {
        suggestionsList.innerHTML = '';
        
        requirements.forEach((req) => {
            const isMet = metCriteria.includes(req.message);
            const li = document.createElement('li');
            
            if (isMet) {
                li.className = 'log-success';
                li.innerHTML = `<span class="log-prefix">[OK]</span> <span>${req.id}_VERIFIED</span>`;
            } else {
                li.className = 'log-fail';
                li.innerHTML = `<span class="log-prefix">[FAIL]</span> <span>REQ_${req.message}</span>`;
            }

            suggestionsList.appendChild(li);
        });
    }
});
