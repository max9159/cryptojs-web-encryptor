import React, { Component } from 'react';
import { render } from 'react-dom';
import './style.css';
import * as CryptoJS from 'crypto-js';

class App extends Component {
  constructor() {
    super();
    this.state = {
      inputText: '',
      inputKey: '',
      encryptedBase64Input: '',
      encryptedBase64: '',
      decryptKey: '',
      decryptedText: '',
      jsonInput: '',
      decryptedJson: '',
      jsonDecryptKey: '',
      kvContentInput: '',
      kvDecryptKey: '',
      kvDecryptedOutput: '',
      kvPlainInput: '',
      kvEncryptKey: '',
      kvEncryptedOutput: '',
      darkMode: false,
      copied: {
        encIn: false,
        decOut: false,
        jsonOut: false,
        kvOut: false,
        kvEncOut: false,
      },
    };
  }

  componentDidMount() {
    document.title = 'CryptoJS Web Encryptor';
  }

  encryptAES = (text, key) => {
    return CryptoJS.AES.encrypt(text, key).toString();
  };

  decryptAES = (encryptedBase64, key) => {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key);
      const str = decrypted.toString(CryptoJS.enc.Utf8);
      return str.length > 0 ? str : 'Decryption error';
    } catch (e) {
      return 'Decryption error';
    }
  };

  handleInputTextChange = (event) => {
    this.setState({ inputText: event.target.value }, this.encryptInputText);
  };

  handleInputKeyChange = (event) => {
    this.setState({ inputKey: event.target.value }, this.encryptInputText);
  };

  encryptInputText = () => {
    this.setState({
      encryptedBase64Input: this.encryptAES(
        this.state.inputText,
        this.state.inputKey
      ),
    });
  };

  handleDecryptKeyChange = (event) => {
    this.setState({ decryptKey: event.target.value }, this.decryptOutputText);
  };

  handleMsgChange = (event) => {
    this.setState(
      { encryptedBase64: event.target.value },
      this.decryptOutputText
    );
  };

  handleJsonInputChange = (event) => {
    this.setState({ jsonInput: event.target.value }, this.decryptJson);
  };

  handleJsonDecryptKeyChange = (event) => {
    this.setState({ jsonDecryptKey: event.target.value }, this.decryptJson);
  };

  decryptOutputText = () => {
    this.setState({
      decryptedText: this.decryptAES(
        this.state.encryptedBase64,
        this.state.decryptKey
      ),
    });
  };

  decryptJsonRecursive = (data, key) => {
    if (typeof data === 'string') {
      return this.decryptAES(data, key);
    } else if (Array.isArray(data)) {
      return data.map((item) => this.decryptJsonRecursive(item, key));
    } else if (typeof data === 'object' && data !== null) {
      let decryptedObj = {};
      Object.keys(data).forEach((subKey) => {
        decryptedObj[subKey] = this.decryptJsonRecursive(data[subKey], key);
      });
      return decryptedObj;
    }
    return data;
  };

  decryptJson = () => {
    try {
      const jsonData = JSON.parse(this.state.jsonInput);
      const decryptedJson = this.decryptJsonRecursive(
        jsonData,
        this.state.jsonDecryptKey
      );
      this.setState({ decryptedJson: JSON.stringify(decryptedJson, null, 2) });
    } catch (e) {
      this.setState({ decryptedJson: 'Invalid JSON format' });
    }
  };

  handleKvEncKeyChange = (event) => {
    this.setState(
      { kvEncryptKey: event.target.value },
      this.encryptKeyValueContent
    );
  };

  handleKvPlainChange = (event) => {
    this.setState(
      { kvPlainInput: event.target.value },
      this.encryptKeyValueContent
    );
  };

  encryptKeyValueContent = () => {
    const content = this.state.kvPlainInput || '';
    const key = this.state.kvEncryptKey || '';
    if (!content) {
      this.setState({ kvEncryptedOutput: '' });
      return;
    }
    const lines = content.split(/\r?\n/);
    const encryptedLines = lines.map((line) => {
      if (!line.includes('=')) return line;
      const idx = line.indexOf('=');
      const left = line.slice(0, idx);
      const right = line.slice(idx + 1);

      // Preserve surrounding quotes if present
      const trimmed = right.trim();
      const hasDoubleQuotes =
        trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2;
      const hasSingleQuotes =
        trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2;

      const unwrap = (s) => s.substring(1, s.length - 1);
      const rewrap = (s, quote) => `${quote}${s}${quote}`;

      const originalRight = right;
      let valueToEncrypt = trimmed;
      let quoteChar = '';
      if (hasDoubleQuotes) {
        valueToEncrypt = unwrap(trimmed);
        quoteChar = '"';
      } else if (hasSingleQuotes) {
        valueToEncrypt = unwrap(trimmed);
        quoteChar = "'";
      }

      if (!key) {
        return `${left}=${originalRight}`;
      }

      const encrypted = this.encryptAES(valueToEncrypt, key);
      const newRight = quoteChar ? rewrap(encrypted, quoteChar) : encrypted;
      // Keep original spacing around '=' by replacing trimmed portion only
      const start = right.indexOf(trimmed);
      const end = start + trimmed.length;
      const reconstructedRight =
        right.slice(0, start) + newRight + right.slice(end);
      return `${left}=${reconstructedRight}`;
    });
    this.setState({ kvEncryptedOutput: encryptedLines.join('\n') });
  };

  handleKvKeyChange = (event) => {
    this.setState(
      { kvDecryptKey: event.target.value },
      this.decryptKeyValueContent
    );
  };

  handleKvContentChange = (event) => {
    this.setState(
      { kvContentInput: event.target.value },
      this.decryptKeyValueContent
    );
  };

  decryptKeyValueContent = () => {
    const content = this.state.kvContentInput || '';
    const key = this.state.kvDecryptKey || '';
    if (!content) {
      this.setState({ kvDecryptedOutput: '' });
      return;
    }
    const lines = content.split(/\r?\n/);
    const decryptedLines = lines.map((line) => {
      if (!line.includes('=')) return line;
      const idx = line.indexOf('=');
      const left = line.slice(0, idx);
      const right = line.slice(idx + 1);

      // Preserve surrounding quotes if present
      const trimmed = right.trim();
      const hasDoubleQuotes =
        trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2;
      const hasSingleQuotes =
        trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2;

      const unwrap = (s) => s.substring(1, s.length - 1);
      const rewrap = (s, quote) => `${quote}${s}${quote}`;

      const originalRight = right;
      let valueToTry = trimmed;
      let quoteChar = '';
      if (hasDoubleQuotes) {
        valueToTry = unwrap(trimmed);
        quoteChar = '"';
      } else if (hasSingleQuotes) {
        valueToTry = unwrap(trimmed);
        quoteChar = "'";
      }

      const attempt = key
        ? this.decryptAES(valueToTry, key)
        : 'Decryption error';
      if (attempt && attempt !== 'Decryption error') {
        const newRight = quoteChar ? rewrap(attempt, quoteChar) : attempt;
        // Keep original spacing around '=' by replacing trimmed portion only
        const start = right.indexOf(trimmed);
        const end = start + trimmed.length;
        const reconstructedRight =
          right.slice(0, start) + newRight + right.slice(end);
        return `${left}=${reconstructedRight}`;
      }

      return `${left}=${originalRight}`;
    });
    this.setState({ kvDecryptedOutput: decryptedLines.join('\n') });
  };

  setCopyFeedback = (key) => {
    this.setState({ copied: { ...this.state.copied, [key]: true } });
    setTimeout(() => {
      this.setState({ copied: { ...this.state.copied, [key]: false } });
    }, 1200);
  };

  copyToClipboard = (text, key) => {
    if (!text) return;
    const doSet = () => this.setCopyFeedback(key);
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(doSet)
        .catch(() => {
          try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.top = '-1000px';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            doSet();
          } catch (e) { }
        });
    } else {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        doSet();
      } catch (e) { }
    }
  };

  toggleDarkMode = () => {
    this.setState({ darkMode: !this.state.darkMode });
  };

  render() {
    return (
      <div className={this.state.darkMode ? 'dark-mode' : 'light-mode'}>
        <div className="app-header">
          <h2 className="page-title">CryptoJS Web Encryptor</h2>
          <label className="theme-toggle">
            <span className="label">Dark mode</span>
            <input
              type="checkbox"
              className="switch-input"
              checked={this.state.darkMode}
              onChange={this.toggleDarkMode}
            />
            <span className="switch" aria-hidden="true"></span>
          </label>
        </div>

        <div className="grid-2">
          {/* Encrypt section */}
          <div className="card">
            <h1>🔒Encrypt Single String</h1>
            <div className="form-group">
              <input
                className="form-control"
                value={this.state.inputText}
                onChange={this.handleInputTextChange}
                style={{ width: '40%', height: 40 }}
                placeholder="Input Text"
              />
              <input
                className="form-control"
                value={this.state.inputKey}
                onChange={this.handleInputKeyChange}
                style={{ width: '40%', height: 40 }}
                placeholder="Key"
              />
            </div>
            <div className="output-card">
              <button
                className="copy-btn"
                aria-label="Copy encrypted output"
                onClick={() =>
                  this.copyToClipboard(this.state.encryptedBase64Input, 'encIn')
                }
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                </svg>
              </button>
              <div
                className={
                  'copy-feedback' + (this.state.copied.encIn ? ' show' : '')
                }
              >
                Copied
              </div>
              <pre className="output">
                <code>{this.state.encryptedBase64Input}</code>
              </pre>
            </div>
          </div>

          {/* Decrypt section */}
          <div className="card">
            <h1>🔓Decrypt Single String</h1>
            <div className="form-group">
              <input
                className="form-control"
                value={this.state.encryptedBase64}
                onChange={this.handleMsgChange}
                style={{ width: '40%', height: 40 }}
                placeholder="Encrypted String"
              />
              <input
                className="form-control"
                value={this.state.decryptKey}
                onChange={this.handleDecryptKeyChange}
                style={{ width: '40%', height: 40 }}
                placeholder="Key"
              />
            </div>
            <div className="output-card">
              <button
                className="copy-btn"
                aria-label="Copy decrypted output"
                onClick={() =>
                  this.copyToClipboard(this.state.decryptedText, 'decOut')
                }
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                </svg>
              </button>
              <div
                className={
                  'copy-feedback' + (this.state.copied.decOut ? ' show' : '')
                }
              >
                Copied
              </div>
              <pre className="output">
                <code>{this.state.decryptedText}</code>
              </pre>
            </div>
          </div>
        </div>
        {/* Encrypt/Decrypt key-value Content section */}
        <div className="grid-2">
          <div className="card">
            <h1>🔒Encrypt key-value Content</h1>
            <div className="form-group">
              <input
                className="form-control"
                value={this.state.kvEncryptKey}
                onChange={this.handleKvEncKeyChange}
                style={{ width: '40%', height: 40 }}
                placeholder="Encryption Key"
              />
              <textarea
                className="form-control"
                value={this.state.kvPlainInput}
                onChange={this.handleKvPlainChange}
                style={{ width: '80%', height: 120 }}
                placeholder="Paste key=value lines here"
              />
            </div>
            <div className="output-card">
              <button
                className="copy-btn"
                aria-label="Copy key-value encrypted output"
                onClick={() =>
                  this.copyToClipboard(this.state.kvEncryptedOutput, 'kvEncOut')
                }
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                </svg>
              </button>
              <div
                className={
                  'copy-feedback' + (this.state.copied.kvEncOut ? ' show' : '')
                }
              >
                Copied
              </div>
              <pre className="output">
                <code>{this.state.kvEncryptedOutput}</code>
              </pre>
            </div>
          </div>

          <div className="card">
            <h1>🔓Decrypt key-value Content</h1>
            <div className="form-group">
              <input
                className="form-control"
                value={this.state.kvDecryptKey}
                onChange={this.handleKvKeyChange}
                style={{ width: '40%', height: 40 }}
                placeholder="Decryption Key"
              />
              <textarea
                className="form-control"
                value={this.state.kvContentInput}
                onChange={this.handleKvContentChange}
                style={{ width: '80%', height: 120 }}
                placeholder="Paste key=value lines here"
              />
            </div>
            <div className="output-card">
              <button
                className="copy-btn"
                aria-label="Copy key-value output"
                onClick={() =>
                  this.copyToClipboard(this.state.kvDecryptedOutput, 'kvOut')
                }
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                </svg>
              </button>
              <div
                className={
                  'copy-feedback' + (this.state.copied.kvOut ? ' show' : '')
                }
              >
                Copied
              </div>
              <pre className="output">
                <code>{this.state.kvDecryptedOutput}</code>
              </pre>
            </div>
          </div>
        </div>
        
        {/* Decrypt JSON section */}
        <div className="card">
          <h1>🔓Decrypt JSON</h1>
          <div className="form-group">
            <input
              className="form-control"
              value={this.state.jsonDecryptKey}
              onChange={this.handleJsonDecryptKeyChange}
              style={{ width: '40%', height: 40 }}
              placeholder="Decryption Key"
            />
            <textarea
              className="form-control"
              value={this.state.jsonInput}
              onChange={this.handleJsonInputChange}
              style={{ width: '80%', height: 100 }}
              placeholder="Paste Encrypted JSON Here"
            />
          </div>
          <div className="output-card">
            <button
              className="copy-btn"
              aria-label="Copy JSON output"
              onClick={() =>
                this.copyToClipboard(this.state.decryptedJson, 'jsonOut')
              }
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
              </svg>
            </button>
            <div
              className={
                'copy-feedback' + (this.state.copied.jsonOut ? ' show' : '')
              }
            >
              Copied
            </div>
            <pre className="output">
              <code>{this.state.decryptedJson}</code>
            </pre>
          </div>
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
