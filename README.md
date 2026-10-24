# PIN Generator

A client-side security token generator and interactive verification keypad terminal built with vanilla **HTML5**, **CSS3**, and **JavaScript**.

## 📁 Standard Project Structure

```text
├── index.html        # Main HTML5 entry point & UI markup
├── style.css         # Minimalist responsive CSS design system
├── script.js         # Application logic & native audio synthesizer
└── README.md         # Documentation
```

## 🚀 Features

- **Random Token Generator**: 4-digit and 6-digit rolling OTP generation.
- **Interactive Terminal Keypad**: Tactile numeric pad with backspace and clear.
- **Physical Keyboard Support**: Use digits `0-9`, `Backspace`, `Escape`, and `Enter`.
- **Security States**:
  - Live 3-attempt tracker with warning and lockout indicators.
  - Shake animation on mismatch.
  - Security Lockout screen with cooldown timer and emergency override.
- **Native Audio Synthesizer**: Web Audio API sound effects for keystrokes, success, and error alerts (toggleable).
- **Zero External Dependencies**: Fast, lightweight, and works completely offline.
