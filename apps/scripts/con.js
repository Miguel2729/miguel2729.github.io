(function() {
    // Verifica se o console já foi injetado para evitar duplicação
    if (window.advancedMobileConsoleInjected) return;
    window.advancedMobileConsoleInjected = true;

    // Adiciona estilos CSS
    const style = document.createElement('style');
style.textContent = `    .amc-container {
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 99999;
            font-family: 'Roboto Mono', monospace;
            font-size: 14px;
            touch-action: manipulation;
        }
        
        .amc-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
        }
        
        .amc-button {
            padding: 8px 12px;
            background-color: #333;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-left: 5px;
            font-size: 12px;
            user-select: none;
        }
        
        .amc-button:hover {
            opacity: 0.9;
        }
        
        .amc-panel {
            display: none;
            width: 90vw;
            max-width: 500px;
            max-height: 70vh;
            overflow-y: auto;
            background-color: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            border: 1px solid #444;
        }
        
        .amc-log-entry {
            margin-bottom: 8px;
            word-break: break-word;
            line-height: 1.4;
            border-bottom: 1px solid #333;
            padding-bottom: 5px;
        }
        
        .amc-log-time {
            color: #888;
            font-size: 11px;
            margin-right: 5px;
        }
        
        .amc-input-area {
            display: flex;
            margin-top: 10px;
        }
        
        .amc-input {
            flex-grow: 1;
            padding: 8px;
            background: #222;
            color: white;
            border: 1px solid #444;
            border-radius: 4px;
            font-family: 'Roboto Mono', monospace;
            font-size: 14px;
        }
        
        .amc-tab-bar {
            display: flex;
            margin-bottom: 5px;
            border-bottom: 1px solid #444;
        }
        
        .amc-tab {
            padding: 8px 15px;
            background: #222;
            color: #aaa;
            border: none;
            border-radius: 4px 4px 0 0;
            margin-right: 5px;
            cursor: pointer;
        }
        
        .amc-tab.active {
            background: #333;
            color: white;
            border-bottom: 2px solid #4CAF50;
        }
        
        .amc-tab-content {
            display: none;
        }
        
        .amc-tab-content.active {
            display: block;
        }
        
        .amc-object-viewer {
            color: #4CAF50;
            cursor: pointer;
        }
        
        .amc-object-details {
            margin-left: 15px;
            padding-left: 10px;
            border-left: 2px solid #333;
            display: none;
        }
        
        .amc-clear-button {
            background-color: #f44336 !important;
        }
        
        .amc-network-log {
            color: #2196F3;
        }
        
        @media (max-width: 500px) {
            .amc-container {
                left: 10px;
                right: 10px;
                width: calc(100% - 20px);
            }
            
            .amc-panel {
                width: 100%;
            }
            
            .amc-button {
                padding: 6px 8px;
                font-size: 11px;
            }
        }`;
document.head.appendChild(style);

    // Cria o container principal
    const consoleContainer = document.createElement('div');
    consoleContainer.className = 'amc-container';
    
    // Cria o cabeçalho com botões
    const header = document.createElement('div');
    header.className = 'amc-header';
    
    const toggleButton = document.createElement('button');
    toggleButton.className = 'amc-button';
    toggleButton.textContent = 'Console';
    toggleButton.id = 'amc-toggle';
    
    const clearButton = document.createElement('button');
    clearButton.className = 'amc-button amc-clear-button';
    clearButton.textContent = 'Clear';
    clearButton.id = 'amc-clear';
    
    header.appendChild(toggleButton);
    header.appendChild(clearButton);
    
    // Cria a barra de abas
    const tabBar = document.createElement('div');
    tabBar.className = 'amc-tab-bar';
    
    const consoleTab = document.createElement('button');
    consoleTab.className = 'amc-tab active';
    consoleTab.textContent = 'Console';
    consoleTab.dataset.tab = 'console';
    
    const networkTab = document.createElement('button');
    networkTab.className = 'amc-tab';
    networkTab.textContent = 'Network';
    networkTab.dataset.tab = 'network';
    
    const domTab = document.createElement('button');
    domTab.className = 'amc-tab';
    domTab.textContent = 'DOM';
    domTab.dataset.tab = 'dom';
    
    tabBar.appendChild(consoleTab);
    tabBar.appendChild(networkTab);
    tabBar.appendChild(domTab);
    
    // Cria o painel principal
    const consolePanel = document.createElement('div');
    consolePanel.className = 'amc-panel';
    
    // Cria conteúdos das abas
    const consoleContent = document.createElement('div');
    consoleContent.className = 'amc-tab-content active';
    consoleContent.id = 'amc-console-content';
    
    const networkContent = document.createElement('div');
    networkContent.className = 'amc-tab-content';
    networkContent.id = 'amc-network-content';
    networkContent.innerHTML = '<div>Network requests will appear here</div>';
    
    const domContent = document.createElement('div');
    domContent.className = 'amc-tab-content';
    domContent.id = 'amc-dom-content';
    domContent.innerHTML = `
        <div style="margin-bottom: 10px;">
            <input type="text" id="amc-dom-selector" class="amc-input" placeholder="Enter CSS selector (e.g., div.my-class)" />
            <button id="amc-dom-query" class="amc-button" style="margin-left: 5px;">Query</button>
        </div>
        <div id="amc-dom-results"></div>
    `;
    
    // Área de input para executar JS
    const inputArea = document.createElement('div');
    inputArea.className = 'amc-input-area';
    
    const inputField = document.createElement('input');
    inputField.className = 'amc-input';
    inputField.placeholder = 'Enter JavaScript code...';
    inputField.id = 'amc-js-input';
    
    const evalButton = document.createElement('button');
    evalButton.className = 'amc-button';
    evalButton.textContent = 'Run';
    evalButton.id = 'amc-eval-button';
    
    inputArea.appendChild(inputField);
    inputArea.appendChild(evalButton);
    
    // Monta a estrutura
    consolePanel.appendChild(tabBar);
    consolePanel.appendChild(consoleContent);
    consolePanel.appendChild(networkContent);
    consolePanel.appendChild(domContent);
    consolePanel.appendChild(inputArea);
    
    consoleContainer.appendChild(header);
    consoleContainer.appendChild(consolePanel);
    document.body.appendChild(consoleContainer);
    
    // Variáveis de estado
    const logs = [];
    const networkLogs = [];
    let activeTab = 'console';
    
    // Função para formatar objetos como strings expansíveis
    function formatObject(obj, depth = 0) {
        if (depth > 3) return '...';
        
        if (obj === null) return 'null';
        if (obj === undefined) return 'undefined';
        
        if (typeof obj === 'object') {
            if (obj instanceof Error) {
                return `Error: ${obj.message}\n${obj.stack}`;
            }
            
            if (Array.isArray(obj)) {
                if (obj.length === 0) return '[]';
                const elements = obj.slice(0, 5).map(item => formatObject(item, depth + 1));
                const more = obj.length > 5 ? `... +${obj.length - 5} more` : '';
                return `[ ${elements.join(', ')}${more ? ', ' + more : ''} ]`;
            }
            
            const keys = Object.keys(obj).slice(0, 5);
            if (keys.length === 0) return '{}';
            
            const entries = keys.map(key => {
                try {
                    return `${key}: ${formatObject(obj[key], depth + 1)}`;
                } catch (e) {
                    return `${key}: [unable to display]`;
                }
            });
            
            const more = Object.keys(obj).length > 5 ? `... +${Object.keys(obj).length - 5} more` : '';
            return `{ ${entries.join(', ')}${more ? ', ' + more : ''} }`;
        }
        
        if (typeof obj === 'function') return 'function() { ... }';
        
        return String(obj);
    }
    
    // Função para criar elemento de log expansível
    function createExpandableLog(content, details) {
        const container = document.createElement('div');
        container.className = 'amc-log-entry';
        
        const preview = document.createElement('span');
        preview.className = 'amc-object-viewer';
        preview.textContent = content;
        preview.onclick = function() {
            detailsEl.style.display = detailsEl.style.display === 'none' ? 'block' : 'none';
        };
        
        const detailsEl = document.createElement('div');
        detailsEl.className = 'amc-object-details';
        detailsEl.style.display = 'none';
        detailsEl.textContent = details;
        
        container.appendChild(preview);
        container.appendChild(detailsEl);
        
        return container;
    }
    
    // Função para adicionar mensagem ao console
    function addLog(type, args) {
        const logEntry = document.createElement('div');
        logEntry.className = 'amc-log-entry';
        
        // Adiciona timestamp
        const timeStamp = document.createElement('span');
        timeStamp.className = 'amc-log-time';
        timeStamp.textContent = new Date().toLocaleTimeString();
        logEntry.appendChild(timeStamp);
        
        // Processa os argumentos
        const content = Array.from(args).map(arg => {
            if (typeof arg === 'object' && arg !== null) {
                const preview = formatObject(arg);
                const details = JSON.stringify(arg, null, 2) || preview;
                const expandable = createExpandableLog(preview, details);
                logEntry.appendChild(expandable);
                return '';
            }
            return String(arg);
        }).filter(Boolean).join(' ');
        
        if (content) {
            const textNode = document.createTextNode(content + ' ');
            logEntry.insertBefore(textNode, logEntry.children[1] || null);
        }
        
        // Cor baseada no tipo de log
        switch(type) {
            case 'error':
                logEntry.style.color = '#ff6b6b';
                break;
            case 'warn':
                logEntry.style.color = '#feca57';
                break;
            case 'info':
                logEntry.style.color = '#54a0ff';
                break;
            case 'network':
                logEntry.style.color = '#2196F3';
                break;
            default: // log
                logEntry.style.color = 'white';
        }
        
        consoleContent.appendChild(logEntry);
        logs.push(logEntry);
        
        // Auto-scroll para baixo se estiver na aba de console
        if (activeTab === 'console') {
            consoleContent.scrollTop = consoleContent.scrollHeight;
        }
        
        // Limita o número de logs para evitar consumo excessivo de memória
        if (logs.length > 200) {
            const oldestLog = logs.shift();
            oldestLog.remove();
        }
    }
    
    // Função para adicionar requisição de rede
    function addNetworkRequest(url, method, status, response) {
        const logEntry = document.createElement('div');
        logEntry.className = 'amc-log-entry amc-network-log';
        
        const timeStamp = document.createElement('span');
        timeStamp.className = 'amc-log-time';
        timeStamp.textContent = new Date().toLocaleTimeString();
        logEntry.appendChild(timeStamp);
        
        const methodSpan = document.createElement('span');
        methodSpan.style.color = '#4CAF50';
        methodSpan.textContent = method + ' ';
        logEntry.appendChild(methodSpan);
        
        const statusSpan = document.createElement('span');
        statusSpan.style.color = status >= 400 ? '#ff6b6b' : '#4CAF50';
        statusSpan.textContent = status + ' ';
        logEntry.appendChild(statusSpan);
        
        const urlSpan = document.createElement('span');
        urlSpan.textContent = url;
        logEntry.appendChild(urlSpan);
        
        if (response) {
            logEntry.onclick = function() {
                const details = logEntry.querySelector('.amc-object-details');
                if (details) {
                    details.style.display = details.style.display === 'none' ? 'block' : 'none';
                } else {
                    const detailsEl = document.createElement('div');
                    detailsEl.className = 'amc-object-details';
                    detailsEl.textContent = typeof response === 'object' ? 
                        JSON.stringify(response, null, 2) : String(response);
                    logEntry.appendChild(detailsEl);
                }
            };
            logEntry.style.cursor = 'pointer';
            logEntry.style.textDecoration = 'underline';
        }
        
        networkContent.appendChild(logEntry);
        networkLogs.push(logEntry);
        
        // Limita o número de logs de rede
        if (networkLogs.length > 100) {
            const oldestLog = networkLogs.shift();
            oldestLog.remove();
        }
    }
    
    // Monitora requisições de rede (XMLHttpRequest e fetch)
    function monitorNetwork() {
        // Monitora XMLHttpRequest
        const originalXHR = window.XMLHttpRequest;
        
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const open = xhr.open;
            const send = xhr.send;
            let method, url;
            
            xhr.open = function() {
                method = arguments[0];
                url = arguments[1];
                return open.apply(xhr, arguments);
            };
            
            xhr.send = function() {
                xhr.addEventListener('load', function() {
                    try {
                        const response = xhr.responseText.length > 1000 ? 
                            xhr.responseText.substring(0, 1000) + '...' : xhr.responseText;
                        addNetworkRequest(url, method, xhr.status, response);
                    } catch (e) {
                        addNetworkRequest(url, method, xhr.status, '[unable to parse response]');
                    }
                });
                
                xhr.addEventListener('error', function() {
                    addNetworkRequest(url, method, 0, 'Network Error');
                });
                
                return send.apply(xhr, arguments);
            };
            
            return xhr;
        };
        
        // Monitora fetch
        const originalFetch = window.fetch;
        
        window.fetch = function() {
            const url = arguments[0].url || arguments[0];
            const method = arguments[1]?.method || 'GET';
            
            return originalFetch.apply(this, arguments).then(response => {
                const clone = response.clone();
                clone.text().then(text => {
                    const shortened = text.length > 1000 ? text.substring(0, 1000) + '...' : text;
                    addNetworkRequest(url, method, response.status, shortened);
                }).catch(() => {
                    addNetworkRequest(url, method, response.status, '[unable to parse response]');
                });
                return response;
            }).catch(error => {
                addNetworkRequest(url, method, 0, 'Fetch Error: ' + error.message);
                throw error;
            });
        };
    }
    
    // Sobrescreve os métodos originais do console
    const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info,
        debug: console.debug
    };
    
    console.log = function() {
        originalConsole.log.apply(console, arguments);
        addLog('log', arguments);
    };
    
    console.error = function() {
        originalConsole.error.apply(console, arguments);
        addLog('error', arguments);
    };
    
    console.warn = function() {
        originalConsole.warn.apply(console, arguments);
        addLog('warn', arguments);
    };
    
    console.info = function() {
        originalConsole.info.apply(console, arguments);
        addLog('info', arguments);
    };
    
    console.debug = function() {
        originalConsole.debug.apply(console, arguments);
        addLog('debug', arguments);
    };
    
    // Adiciona evento de clique ao botão de toggle
    toggleButton.addEventListener('click', function() {
        consolePanel.style.display = consolePanel.style.display === 'none' ? 'block' : 'none';
        if (consolePanel.style.display === 'block') {
            consoleContent.scrollTop = consoleContent.scrollHeight;
        }
    });
    
    // Adiciona evento de clique ao botão de clear
    clearButton.addEventListener('click', function() {
        if (activeTab === 'console') {
            consoleContent.innerHTML = '';
            logs.length = 0;
        } else if (activeTab === 'network') {
            networkContent.innerHTML = '<div>Network requests will appear here</div>';
            networkLogs.length = 0;
        }
    });
    
    // Adiciona eventos para troca de abas
    [consoleTab, networkTab, domTab].forEach(tab => {
        tab.addEventListener('click', function() {
            // Atualiza abas
            document.querySelectorAll('.amc-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Atualiza conteúdos
            document.querySelectorAll('.amc-tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`amc-${this.dataset.tab}-content`).classList.add('active');
            
            activeTab = this.dataset.tab;
        });
    });
    
    // Adiciona evento para executar código JS
    evalButton.addEventListener('click', function() {
        const code = inputField.value.trim();
        if (!code) return;
        
        try {
            const result = eval(code);
            console.log('> ' + code);
            console.log('<', result);
            inputField.value = '';
        } catch (e) {
            console.error('Error:', e);
        }
    });
    
    // Adiciona suporte para Enter no input
    inputField.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            evalButton.click();
        }
    });
    
    // Adiciona funcionalidade de query DOM
    document.getElementById('amc-dom-query').addEventListener('click', function() {
        const selector = document.getElementById('amc-dom-selector').value.trim();
        if (!selector) return;
        
        try {
            const results = document.querySelectorAll(selector);
            const resultsContainer = document.getElementById('amc-dom-results');
            resultsContainer.innerHTML = '';
            
            if (results.length === 0) {
                resultsContainer.innerHTML = '<div>No elements found</div>';
                return;
            }
            
            resultsContainer.innerHTML = `<div>Found ${results.length} element(s):</div>`;
            
            Array.from(results).slice(0, 10).forEach((el, i) => {
                const elDiv = document.createElement('div');
                elDiv.style.margin = '10px 0';
                elDiv.style.padding = '10px';
                elDiv.style.border = '1px solid #444';
                elDiv.style.borderRadius = '4px';
                
                const summary = document.createElement('div');
                summary.style.fontWeight = 'bold';
                summary.style.marginBottom = '5px';
                summary.textContent = `${i + 1}. ${el.tagName.toLowerCase()}`;
                
                if (el.id) summary.textContent += `#${el.id}`;
                if (el.className) summary.textContent += `.${el.className.split(' ').join('.')}`;
                
                const inspectBtn = document.createElement('button');
                inspectBtn.className = 'amc-button';
                inspectBtn.style.marginRight = '5px';
                inspectBtn.textContent = 'Inspect';
                inspectBtn.onclick = function() {
                    console.log('Selected element:', el);
                    el.style.outline = '2px solid red';
                    setTimeout(() => el.style.outline = '', 2000);
                };
                
                const logBtn = document.createElement('button');
                logBtn.className = 'amc-button';
                logBtn.textContent = 'Log';
                logBtn.onclick = function() {
                    console.log(el);
                };
                
                elDiv.appendChild(summary);
                elDiv.appendChild(inspectBtn);
                elDiv.appendChild(logBtn);
                resultsContainer.appendChild(elDiv);
            });
            
            if (results.length > 10) {
                resultsContainer.innerHTML += `<div>... and ${results.length - 10} more elements</div>`;
            }
        } catch (e) {
            document.getElementById('amc-dom-results').innerHTML = `<div style="color: #ff6b6b">Error: ${e.message}</div>`;
        }
    });
    
    // Inicia monitoramento de rede
    monitorNetwork();
    
    // Adiciona logs iniciais
    console.log('Advanced Mobile Console initialized');
    console.log('User Agent:', navigator.userAgent);
    console.log('Screen:', `${window.screen.width}x${window.screen.height}`);
    console.log('Viewport:', `${window.innerWidth}x${window.innerHeight}`);
    
    // Adiciona evento para fechar o console ao tocar fora (apenas em mobile)
    document.addEventListener('click', function(e) {
        if (!consoleContainer.contains(e.target) && e.target !== toggleButton) {
            consolePanel.style.display = 'none';
        }
    }, true);
})();