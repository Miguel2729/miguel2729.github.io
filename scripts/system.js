// system.js — núcleo do sistema

window.dom = document;
window.con = console;
window.bro = window;
window.ls = localStorage;

window.addEventListener("DOMContentLoaded", () => {
  try {
    // Logs armazenados separadamente do console nativo
    window.logs = {
      info: [],
      warn: [],
      log: [],
      error: []
    };
    
    // Envia mensagens para o iframe pai
    function sendToParent(type, data) {
      if (parent?.postMessage) {
        parent.postMessage({ type, data }, '*');
      }
    }

    // Recebe comandos do pai
    bro.addEventListener('message', (event) => {
      const msg = event.data;
      if (!msg || !msg.type) return;

      switch (msg.type) {
        case 'getLogs':
          sendToParent('logs', logs);
          break;
        case 'ping':
          sendToParent('pong', 'Sistema ativo');
          break;
      }
    });

    // Impede modificações perigosas
    try {
      Object.defineProperty(bro, 'eval', {
        value: undefined,
        writable: false,
        configurable: false
      });
    } catch {}

    try {
      Object.defineProperty(bro, 'document', {
        value: undefined,
        writable: false,
        configurable: false
      });
    } catch {}

    // Funções para interceptar e armazenar logs
    bro._log = (...args) => {
      logs.log.push(args);
      sendToParent('log', args);
    };
    bro._warn = (...args) => {
      logs.warn.push(args);
      sendToParent('warn', args);
    };
    bro._error = (...args) => {
      logs.error.push(args);
      sendToParent('error', args);
    };
    bro._info = (...args) => {
      logs.info.push(args);
      sendToParent('info', args);
    };

    // Tratamento global de erros
    bro.onerror = function (msg, url, line, col, err) {
      const detalhes = { msg, url, line, col, err };
      logs.error.push(detalhes);
      sendToParent('error', detalhes);
    };

    // Validação de arquivos essenciais
    const essenciais = ['core64.js', 'shell.js'];
    const scripts = [...document.scripts].map(s => s.src);

    essenciais.forEach(arquivo => {
      if (!scripts.some(src => src.includes(arquivo))) {
        sendToParent('fatalError', 'default');
      }
    });

    // Sistema modular de apps
    const System = {
      apps: {},
      registrarApp(nome, definicao) {
        const reservados = ['js', 'con', 'bro'];
        if (reservados.includes(nome)) {
          throw new Error(`O nome "${nome}" é reservado.`);
        }
        this.apps[nome] = definicao;
      }
    };

    bro._System = System;

    _log('✅ system.js carregado com segurança');
  } catch (e) {
    parent?.postMessage?.({ type: 'fatalError', motivo: 1, erro: e.message }, '*');
  }
});

// Detecta dispositivos USB (caso navegador suporte WebUSB)
async function detectarDispositivoUSB() {
  if (!('usb' in navigator)) {
    _error('WebUSB não é suportado neste navegador.');
    return;
  }

  try {
    const dispositivos = await navigator.usb.getDevices();
    if (dispositivos.length > 0) {
      _info('Dispositivo USB detectado:', dispositivos);
      parent.postMessage('installer', '*');
    } else {
      _log('Nenhum dispositivo USB detectado.');
    }
  } catch (erro) {
    _error('Erro ao acessar dispositivos USB:', erro);
  }
}