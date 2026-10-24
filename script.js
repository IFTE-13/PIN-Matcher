(function () {
    let pinLength = 4;
    const MAX_OPPORTUNITIES = 3;

    let generatedPin = "";
    let enteredPin = "";
    let currentOpportunity = MAX_OPPORTUNITIES;
    let lockoutInterval = null;

    // Web Audio Synthesizer (Native, zero external files)
    class SoundFX {
        constructor() {
            this.ctx = null;
            this.enabled = true;
        }

        init() {
            if (!this.ctx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    this.ctx = new AudioContext();
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }

        toggle() {
            this.enabled = !this.enabled;
            return this.enabled;
        }

        playClick() {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.03);
        }

        playGenerate() {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        }

        playError() {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.2);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
        }

        playSuccess() {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const t = this.ctx.currentTime + (i * 0.07);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, t);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.25);
            });
        }
    }

    const sound = new SoundFX();

    // DOM Elements
    const inputNum = document.getElementById("inputNum");
    const calcInputs = document.getElementById("calcInputs");
    const generateBtn = document.getElementById("generateNumber");
    const submitBtn = document.getElementById("submitBtn");
    const opportunityLeft = document.getElementById("opportunityLeft");
    const errorArea = document.getElementById("errorArea");
    const errorMessageText = document.getElementById("errorMessageText");
    const matchingArea = document.getElementById("matchingArea");
    const successModal = document.getElementById("successModal");
    const resetVaultBtn = document.getElementById("resetVaultBtn");
    const lockoutModal = document.getElementById("lockoutModal");
    const lockoutTimerDisplay = document.getElementById("lockoutTimerDisplay");
    const emergencyResetBtn = document.getElementById("emergencyResetBtn");
    const themeResetBtn = document.getElementById("themeResetBtn");
    const backspaceBtn = document.getElementById("backspaceBtn");
    const clearBtn = document.getElementById("clearBtn");
    const soundToggleBtn = document.getElementById("soundToggleBtn");
    const soundOnIcon = document.getElementById("soundOnIcon");
    const soundOffIcon = document.getElementById("soundOffIcon");
    const digitTabs = document.querySelectorAll(".digit-tab");

    // PIN Length Switcher (4 or 6 Digits)
    digitTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            digitTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            pinLength = parseInt(tab.dataset.length, 10);

            const placeholder = "-".repeat(pinLength);
            inputNum.placeholder = placeholder;
            calcInputs.placeholder = placeholder;

            resetInputsOnly();
            sound.playClick();
        });
    });

    // Generate random PIN (4 or 6 digits)
    function generatePin() {
        sound.playGenerate();
        hideError();

        let pin = "";
        if (pinLength === 4) {
            pin = Math.floor(1000 + Math.random() * 9000).toString();
        } else {
            pin = Math.floor(100000 + Math.random() * 900000).toString();
        }

        generatedPin = pin;
        inputNum.value = pin;
    }

    generateBtn.addEventListener("click", generatePin);

    // Keypad Input Handler
    window.handlePinNum = function (num) {
        if (enteredPin.length >= pinLength) return;
        sound.playClick();
        enteredPin += num;
        calcInputs.value = enteredPin;
        hideError();
    };

    function backspace() {
        if (enteredPin.length > 0) {
            sound.playClick();
            enteredPin = enteredPin.slice(0, -1);
            calcInputs.value = enteredPin;
            hideError();
        }
    }

    function clearInput() {
        sound.playClick();
        enteredPin = "";
        calcInputs.value = "";
        hideError();
    }

    if (backspaceBtn) backspaceBtn.addEventListener("click", backspace);
    if (clearBtn) clearBtn.addEventListener("click", clearInput);

    // Physical Keyboard support
    window.addEventListener("keydown", function (e) {
        if (lockoutModal.style.display === "flex" || successModal.style.display === "flex") {
            return;
        }

        if (e.key >= "0" && e.key <= "9") {
            window.handlePinNum(parseInt(e.key, 10));
            highlightKey(e.key);
        } else if (e.key === "Backspace") {
            backspace();
            highlightKey("Backspace");
        } else if (e.key === "Escape") {
            clearInput();
        } else if (e.key === "Enter") {
            submitBtn.click();
        }
    });

    function highlightKey(key) {
        let selector = `.key[onclick*="${key}"]`;
        if (key === "Backspace") selector = "#backspaceBtn";
        const btn = document.querySelector(selector);
        if (btn) {
            btn.classList.add("pressed");
            setTimeout(() => btn.classList.remove("pressed"), 120);
        }
    }

    // Submit & Verification
    submitBtn.addEventListener("click", function () {
        if (!generatedPin || inputNum.value === "") {
            sound.playError();
            showError("Please generate a PIN first.");
            return;
        }

        if (enteredPin.length === 0) {
            sound.playError();
            showError("Please enter a PIN on the keypad.");
            return;
        }

        if (enteredPin.length < pinLength) {
            sound.playError();
            showError(`PIN must be ${pinLength} digits long.`);
            return;
        }

        if (enteredPin === generatedPin) {
            // Success: Show modal directly, NO message below!
            sound.playSuccess();
            hideError();
            if (matchingArea) matchingArea.style.display = "none";
            successModal.style.display = "flex";
        } else {
            // Error: Show message below
            sound.playError();
            handleFailedAttempt();
        }
    });

    function handleFailedAttempt() {
        currentOpportunity = Math.max(0, currentOpportunity - 1);
        opportunityLeft.innerText = currentOpportunity;

        calcInputs.classList.remove("shake");
        void calcInputs.offsetWidth; // reflow
        calcInputs.classList.add("shake");

        showError("PIN didn't match. Please try again.");
        clearInput();

        if (currentOpportunity <= 0) {
            triggerLockout();
        }
    }

    function showError(msg) {
        if (errorMessageText) errorMessageText.innerText = msg;
        errorArea.style.display = "block";
        if (matchingArea) matchingArea.style.display = "none";
    }

    function hideError() {
        errorArea.style.display = "none";
    }

    // Lockout Screen
    function triggerLockout() {
        lockoutModal.style.display = "flex";
        let seconds = 15;
        lockoutTimerDisplay.textContent = `00:${seconds < 10 ? '0' : ''}${seconds}`;

        if (lockoutInterval) clearInterval(lockoutInterval);
        lockoutInterval = setInterval(() => {
            seconds--;
            lockoutTimerDisplay.textContent = `00:${seconds < 10 ? '0' : ''}${seconds}`;
            if (seconds <= 0) {
                clearInterval(lockoutInterval);
                resetAll();
            }
        }, 1000);
    }

    function resetInputsOnly() {
        generatedPin = "";
        inputNum.value = "";
        enteredPin = "";
        calcInputs.value = "";
        hideError();
    }

    function resetAll() {
        if (lockoutInterval) clearInterval(lockoutInterval);
        lockoutModal.style.display = "none";
        successModal.style.display = "none";
        currentOpportunity = MAX_OPPORTUNITIES;
        opportunityLeft.innerText = currentOpportunity;
        resetInputsOnly();
        sound.playClick();
    }

    if (resetVaultBtn) resetVaultBtn.addEventListener("click", resetAll);
    if (emergencyResetBtn) emergencyResetBtn.addEventListener("click", resetAll);
    if (themeResetBtn) themeResetBtn.addEventListener("click", resetAll);

    // Audio Toggle Button
    if (soundToggleBtn) {
        soundToggleBtn.addEventListener("click", () => {
            const isEnabled = sound.toggle();
            if (isEnabled) {
                soundOnIcon.style.display = "block";
                soundOffIcon.style.display = "none";
                sound.playClick();
            } else {
                soundOnIcon.style.display = "none";
                soundOffIcon.style.display = "block";
            }
        });
    }
})();
