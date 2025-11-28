// Miguel Service - Gerenciador de Senhas e Contas
document.addEventListener('DOMContentLoaded', function() {
    // Banco de dados local (simulado)
    const miguelServiceDB = {
        users: JSON.parse(localStorage.getItem('miguelService_users')) || [],
        passwords: JSON.parse(localStorage.getItem('miguelService_passwords')) || {}
    };

    // Elementos da UI
    const uiElements = {
        loginSection: document.getElementById('login-section') || createLoginSection(),
        passwordManagerSection: document.getElementById('password-manager-section') || createPasswordManagerSection(),
        accountSection: document.getElementById('account-section') || createAccountSection(),
        serviceStatus: document.getElementById('service-status') || createServiceStatus()
    };

    // Estado da aplicação
    let currentUser = null;

    // Inicialização
    init();

    function init() {
        // Verificar se há um usuário logado
        const loggedUser = sessionStorage.getItem('miguelService_loggedUser');
        if (loggedUser) {
            currentUser = JSON.parse(loggedUser);
            showPasswordManager();
        } else {
            showLogin();
        }

        // Configurar listeners para comunicação entre iframes
        window.addEventListener('message', handleIframeCommunication);
    }

    // Funções de UI
    function createLoginSection() {
        const section = document.createElement('div');
        section.id = 'login-section';
        section.innerHTML = `
            <h2>Miguel Service - Login</h2>
            <form id="login-form">
                <div>
                    <label for="login-email">E-mail:</label>
                    <input type="email" id="login-email" placeholder="seu@email.com" required>
                </div>
                <div>
                    <label for="login-password">Senha:</label>
                    <input type="password" id="login-password" required>
                </div>
                <button type="submit">Entrar</button>
            </form>
            <button id="create-account-btn">Criar Nova Conta</button>
        `;
        document.body.appendChild(section);
        return section;
    }

    function createPasswordManagerSection() {
        const section = document.createElement('div');
        section.id = 'password-manager-section';
        section.style.display = 'none';
        section.innerHTML = `
            <h2>Miguel Service - Gerenciador de Senhas</h2>
            <div>
                <button id="select-password-btn">Selecionar Senha (S)</button>
                <button id="manage-passwords-btn">Gerenciar Senhas (G+S)</button>
                <button id="logout-btn">Sair</button>
            </div>
            <div id="password-list"></div>
            <div id="password-form-container" style="display: none;">
                <h3>Adicionar/Editar Senha</h3>
                <form id="password-form">
                    <div>
                        <label for="service-name">Serviço:</label>
                        <input type="text" id="service-name" required>
                    </div>
                    <div>
                        <label for="service-username">Usuário:</label>
                        <input type="text" id="service-username">
                    </div>
                    <div>
                        <label for="service-password">Senha:</label>
                        <input type="password" id="service-password" required>
                    </div>
                    <button type="submit">Salvar</button>
                    <button type="button" id="cancel-password-btn">Cancelar</button>
                </form>
            </div>
        `;
        document.body.appendChild(section);
        return section;
    }

    function createAccountSection() {
        const section = document.createElement('div');
        section.id = 'account-section';
        section.style.display = 'none';
        section.innerHTML = `
            <h2>Criar Nova Conta</h2>
            <form id="create-account-form">
                <div>
                    <label for="account-name">Nome:</label>
                    <input type="text" id="account-name" required>
                </div>
                <div>
                    <label for="account-email">E-mail:</label>
                    <input type="email" id="account-email" placeholder="exemplo@migmail.com" required>
                </div>
                <div>
                    <label for="account-password">Senha:</label>
                    <input type="password" id="account-password" required>
                </div>
                <div>
                    <label for="account-confirm-password">Confirmar Senha:</label>
                    <input type="password" id="account-confirm-password" required>
                </div>
                <button type="submit">Criar Conta</button>
                <button type="button" id="back-to-login-btn">Voltar para Login</button>
            </form>
        `;
        document.body.appendChild(section);
        return section;
    }

    function createServiceStatus() {
        const status = document.createElement('div');
        status.id = 'service-status';
        status.style.position = 'fixed';
        status.style.bottom = '10px';
        status.style.right = '10px';
        status.style.padding = '5px 10px';
        status.style.backgroundColor = '#f0f0f0';
        status.style.border = '1px solid #ccc';
        status.style.borderRadius = '5px';
        status.textContent = 'Miguel Service: Desconectado';
        document.body.appendChild(status);
        return status;
    }

    // Funções de navegação
    function showLogin() {
        uiElements.loginSection.style.display = 'block';
        uiElements.passwordManagerSection.style.display = 'none';
        uiElements.accountSection.style.display = 'none';
        uiElements.serviceStatus.textContent = 'Miguel Service: Desconectado';
        
        // Configurar eventos
        document.getElementById('login-form').addEventListener('submit', handleLogin);
        document.getElementById('create-account-btn').addEventListener('click', showCreateAccount);
    }

    function showCreateAccount() {
        uiElements.loginSection.style.display = 'none';
        uiElements.passwordManagerSection.style.display = 'none';
        uiElements.accountSection.style.display = 'block';
        
        // Configurar eventos
        document.getElementById('create-account-form').addEventListener('submit', handleCreateAccount);
        document.getElementById('back-to-login-btn').addEventListener('click', showLogin);
    }

    function showPasswordManager() {
        uiElements.loginSection.style.display = 'none';
        uiElements.passwordManagerSection.style.display = 'block';
        uiElements.accountSection.style.display = 'none';
        uiElements.serviceStatus.textContent = `Miguel Service: Conectado como ${currentUser.email}`;
        
        // Carregar senhas do usuário
        loadUserPasswords();
        
        // Configurar eventos
        document.getElementById('select-password-btn').addEventListener('click', selectPassword);
        document.getElementById('manage-passwords-btn').addEventListener('click', managePasswords);
        document.getElementById('logout-btn').addEventListener('click', logout);
        
        // Configurar atalhos de teclado
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }

    // Funções de manipulação de eventos
    function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const user = miguelServiceDB.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            sessionStorage.setItem('miguelService_loggedUser', JSON.stringify(user));
            showPasswordManager();
        } else {
            alert('E-mail ou senha incorretos!');
        }
    }

    function handleCreateAccount(e) {
        e.preventDefault();
        const name = document.getElementById('account-name').value;
        const email = document.getElementById('account-email').value;
        const password = document.getElementById('account-password').value;
        const confirmPassword = document.getElementById('account-confirm-password').value;
        
        // Validar e-mail customizado
        if (!email.endsWith('@migmail.com')) {
            alert('Por favor, use um e-mail no formato exemplo@migmail.com');
            return;
        }
        
        // Verificar se o e-mail já existe
        if (miguelServiceDB.users.some(u => u.email === email)) {
            alert('Este e-mail já está em uso!');
            return;
        }
        
        // Verificar se as senhas coincidem
        if (password !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }
        
        // Criar nova conta
        const newUser = { name, email, password };
        miguelServiceDB.users.push(newUser);
        localStorage.setItem('miguelService_users', JSON.stringify(miguelServiceDB.users));
        
        alert('Conta criada com sucesso! Por favor, faça login.');
        showLogin();
    }

    function logout() {
        currentUser = null;
        sessionStorage.removeItem('miguelService_loggedUser');
        showLogin();
        document.removeEventListener('keydown', handleKeyboardShortcuts);
    }

    function selectPassword() {
        const passwordList = document.getElementById('password-list');
        passwordList.innerHTML = '';
        
        const userPasswords = miguelServiceDB.passwords[currentUser.email] || [];
        
        if (userPasswords.length === 0) {
            passwordList.innerHTML = '<p>Nenhuma senha cadastrada.</p>';
            return;
        }
        
        const list = document.createElement('ul');
        userPasswords.forEach((pw, index) => {
            const item = document.createElement('li');
            item.innerHTML = `
                <strong>${pw.service}</strong> - ${pw.username}
                <button class="use-password-btn" data-index="${index}">Usar</button>
            `;
            list.appendChild(item);
        });
        
        passwordList.appendChild(list);
        
        // Configurar eventos dos botões
        document.querySelectorAll('.use-password-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                usePassword(userPasswords[index]);
            });
        });
    }

    function managePasswords() {
        const passwordList = document.getElementById('password-list');
        passwordList.innerHTML = '';
        
        const userPasswords = miguelServiceDB.passwords[currentUser.email] || [];
        
        const list = document.createElement('ul');
        userPasswords.forEach((pw, index) => {
            const item = document.createElement('li');
            item.innerHTML = `
                <strong>${pw.service}</strong> - ${pw.username}
                <button class="edit-password-btn" data-index="${index}">Editar</button>
                <button class="delete-password-btn" data-index="${index}">Excluir</button>
            `;
            list.appendChild(item);
        });
        
        passwordList.appendChild(list);
        
        // Adicionar botão para nova senha
        const addBtn = document.createElement('button');
        addBtn.textContent = 'Adicionar Nova Senha';
        addBtn.id = 'add-password-btn';
        passwordList.appendChild(addBtn);
        
        // Mostrar formulário
        const formContainer = document.getElementById('password-form-container');
        formContainer.style.display = 'none';
        
        // Configurar eventos
        document.querySelectorAll('.edit-password-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                showPasswordForm(userPasswords[index], index);
            });
        });
        
        document.querySelectorAll('.delete-password-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                deletePassword(index);
            });
        });
        
        document.getElementById('add-password-btn').addEventListener('click', function() {
            showPasswordForm();
        });
        
        document.getElementById('password-form').addEventListener('submit', function(e) {
            e.preventDefault();
            savePassword();
        });
        
        document.getElementById('cancel-password-btn').addEventListener('click', function() {
            document.getElementById('password-form-container').style.display = 'none';
        });
    }

    function showPasswordForm(passwordData = null, index = -1) {
        const form = document.getElementById('password-form');
        const formContainer = document.getElementById('password-form-container');
        
        if (passwordData) {
            document.getElementById('service-name').value = passwordData.service;
            document.getElementById('service-username').value = passwordData.username || '';
            document.getElementById('service-password').value = passwordData.password;
            form.dataset.editIndex = index;
        } else {
            form.reset();
            delete form.dataset.editIndex;
        }
        
        formContainer.style.display = 'block';
    }

    function savePassword() {
        const form = document.getElementById('password-form');
        const service = document.getElementById('service-name').value;
        const username = document.getElementById('service-username').value;
        const password = document.getElementById('service-password').value;
        
        const newPassword = { service, username, password };
        
        if (!miguelServiceDB.passwords[currentUser.email]) {
            miguelServiceDB.passwords[currentUser.email] = [];
        }
        
        if (form.dataset.editIndex !== undefined) {
            // Editar senha existente
            const index = parseInt(form.dataset.editIndex);
            miguelServiceDB.passwords[currentUser.email][index] = newPassword;
        } else {
            // Adicionar nova senha
            miguelServiceDB.passwords[currentUser.email].push(newPassword);
        }
        
        localStorage.setItem('miguelService_passwords', JSON.stringify(miguelServiceDB.passwords));
        document.getElementById('password-form-container').style.display = 'none';
        managePasswords();
    }

    function deletePassword(index) {
        if (confirm('Tem certeza que deseja excluir esta senha?')) {
            miguelServiceDB.passwords[currentUser.email].splice(index, 1);
            localStorage.setItem('miguelService_passwords', JSON.stringify(miguelServiceDB.passwords));
            managePasswords();
        }
    }

    function usePassword(passwordData) {
        // Enviar dados da senha para o iframe/página principal
        parent.postMessage({
            type: 'miguelService_password',
            service: passwordData.service,
            username: passwordData.username,
            password: passwordData.password
        }, '*');
        
        alert(`Senha para ${passwordData.service} pronta para uso!`);
    }

    function loadUserPasswords() {
        if (!currentUser) return;
        
        if (!miguelServiceDB.passwords[currentUser.email]) {
            miguelServiceDB.passwords[currentUser.email] = [];
        }
    }

    function handleKeyboardShortcuts(e) {
        // S - Selecionar Senha
        if (e.key === 'S' || e.key === 's') {
            e.preventDefault();
            selectPassword();
        }
        
        // G + S - Gerenciar Senhas
        if ((e.key === 'G' || e.key === 'g') && e.shiftKey) {
            e.preventDefault();
            managePasswords();
        }
    }

    function handleIframeCommunication(event) {
        // Verificar se a mensagem é do Miguel Service
        if (event.data.type && event.data.type.startsWith('miguelService_')) {
            switch (event.data.type) {
                case 'miguelService_login':
                    handleExternalLogin(event.data);
                    break;
                case 'miguelService_requestPassword':
                    handlePasswordRequest(event);
                    break;
                // Adicione outros casos conforme necessário
            }
        }
    }

    function handleExternalLogin(data) {
        const { email, password } = data;
        
        const user = miguelServiceDB.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            sessionStorage.setItem('miguelService_loggedUser', JSON.stringify(user));
            showPasswordManager();
            
            // Responder ao iframe que o login foi bem-sucedido
            event.source.postMessage({
                type: 'miguelService_loginResponse',
                success: true,
                user: { name: user.name, email: user.email }
            }, event.origin);
        } else {
            // Responder ao iframe que o login falhou
            event.source.postMessage({
                type: 'miguelService_loginResponse',
                success: false,
                message: 'E-mail ou senha inválidos'
            }, event.origin);
        }
    }

    function handlePasswordRequest(event) {
        if (!currentUser) {
            event.source.postMessage({
                type: 'miguelService_passwordResponse',
                success: false,
                message: 'Usuário não autenticado'
            }, event.origin);
            return;
        }
        
        const { service } = event.data;
        const userPasswords = miguelServiceDB.passwords[currentUser.email] || [];
        const passwordData = userPasswords.find(pw => pw.service === service);
        
        if (passwordData) {
            event.source.postMessage({
                type: 'miguelService_passwordResponse',
                success: true,
                service: passwordData.service,
                username: passwordData.username,
                password: passwordData.password
            }, event.origin);
        } else {
            event.source.postMessage({
                type: 'miguelService_passwordResponse',
                success: false,
                message: 'Senha não encontrada para este serviço'
            }, event.origin);
        }
    }

    // API pública para outros scripts
    window.MiguelService = {
        login: function(email, password) {
            const user = miguelServiceDB.users.find(u => u.email === email && u.password === password);
            return user ? { success: true, user } : { success: false, message: 'Credenciais inválidas' };
        },
        getPassword: function(service) {
            if (!currentUser) return { success: false, message: 'Usuário não autenticado' };
            
            const userPasswords = miguelServiceDB.passwords[currentUser.email] || [];
            const passwordData = userPasswords.find(pw => pw.service === service);
            
            return passwordData ? 
                { success: true, ...passwordData } : 
                { success: false, message: 'Senha não encontrada para este serviço' };
        },
        isAuthenticated: function() {
            return currentUser !== null;
        }
    };
});