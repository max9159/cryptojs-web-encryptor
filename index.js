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
      darkMode: false,
    };
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

  toggleDarkMode = () => {
    this.setState({ darkMode: !this.state.darkMode });
  };

  render() {
    return (
      <div className={this.state.darkMode ? 'dark-mode' : 'light-mode'}>
        {/* <button onClick={this.toggleDarkMode} style={{ marginBottom: 20 }}>
          Toggle Dark Mode
        </button> */}
        <h1>Crypto-JS encryptAES</h1>
        <div className="form-group">
          <input
            className="form-control"
            value={this.state.inputText}
            onChange={this.handleInputTextChange}
            style={{ width: '40%', height: 40, marginRight: 20 }}
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
        <pre className="output">
          <code>{this.state.encryptedBase64Input}</code>
        </pre>

        <h1>Crypto-JS decryptAES</h1>
        <div className="form-group">
          <input
            className="form-control"
            value={this.state.encryptedBase64}
            onChange={this.handleMsgChange}
            style={{ width: '40%', height: 40, marginRight: 20 }}
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
        <pre className="output">
          <code>{this.state.decryptedText}</code>
        </pre>

        <h1>Decrypt JSON</h1>
        <div className="form-group">
          <input
            className="form-control"
            value={this.state.jsonDecryptKey}
            onChange={this.handleJsonDecryptKeyChange}
            style={{ width: '40%', height: 40, marginTop: 10 }}
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
        <pre className="output">
          <code>{this.state.decryptedJson}</code>
        </pre>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
