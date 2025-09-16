## CryptoJS Web Encryptor

Encrypt and decrypt strings, JSON, and .env-style key=value content right in your browser. Built with React and CryptoJS for quick, no-backend cryptography workflows.

### Try it now
- Live demo: [Open in StackBlitz ⚡️](https://stackblitz.com/~/github.com/max9159/cryptojs-web-encryptor)

### Features
- AES encryption/decryption of single strings
- One-click clipboard copy for every output
- Recursive JSON decryption (walks arrays/objects and decrypts string values)
- Key=value helper: encrypts/decrypts only the value, preserves quotes and spacing
- Dark mode toggle

### Quickstart
1) Online (fastest)
- Open the demo above — it boots instantly in your browser.

2) Local development
- Requirements: Node.js 16+ and npm
- Install and run:
```bash
npm install
npm start
```
- Then open http://localhost:3000

### Usage
- Encrypt Single String
  - Type your plaintext and a key; the AES-encrypted Base64 output updates live.

- Decrypt Single String
  - Paste the Base64 ciphertext and enter the key to reveal the plaintext.

- Decrypt JSON
  - Paste a JSON document and a key. The app recursively attempts to decrypt all string values and shows a prettified JSON output.

- Encrypt/Decrypt key=value content
  - Paste lines like `API_TOKEN="..."` and a key. The app encrypts/decrypts only the right-hand side and keeps your original spacing and quotes.

- Copy results
  - Use the copy button on each output block. A quick “Copied” toast confirms success.

### How it works
- Uses CryptoJS AES with a passphrase-derived key under the hood.
- This tool is designed for developer convenience (secrets handling, config prep, quick checks).

### Security note
- For production-grade cryptography, prefer audited key management and modern KDFs. Treat browser-based encryption tools as convenience utilities and review your threat model accordingly.

### Tech stack
- React 16, CryptoJS 3

### Development
- Build: `npm run build`
- Tests: none (lightweight demo app)

### Contributing
Issues and PRs are welcome. If you’d like a new mode (e.g., custom IV/salt handling or JSON encryption), open an issue to discuss.
