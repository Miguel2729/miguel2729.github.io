// scripts/parental-control.js
class ParentalControl {
  constructor() {
    this.settings = {
      enabled: false,
      supervisedUsers: [],
      blockedApps: [],
      dailyLimits: {},
      defaultLimits: {}
    };
    
    this.usageTimers = {};
    this.activityLogs = [];
    this.availableApps = [];
    this.loadSettings();
    this.setupListeners();
    this.startDailyResetTimer();
    this.loadAvailableApps();
  }

  async loadAvailableApps() {
    try {
      const response = await fetch('apps.json');
      if (response.ok) {
        this.availableApps = await response.json();
      } else {
        console.error('Falha ao carregar apps.json');
        this.availableApps = ['calculadora.html', 'jogo.html', 'navegador.html'];
      }
    } catch (error) {
      console.error('Erro ao carregar apps.json:', error);
      this.availableApps = ['calculadora.html', 'jogo.html', 'navegador.html'];
    }
  }
  
  initializeDefaultLimits() {
    this.settings.supervisedUsers.forEach(userId => {
      if (!this.settings.defaultLimits[userId]) {
        this.settings.defaultLimits[userId] = 120;
      }
    });
  }
  
  loadSettings() {
    const saved = localStorage.getItem('parentalControlSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.assign(this.settings, parsed);
        
        const logs = localStorage.getItem('parentalControlLogs');
        if (logs) {
          this.activityLogs = JSON.parse(logs);
        }
      } catch (e) {
        console.error('Erro ao carregar configurações:', e);
      }
    }
  }
  
  saveSettings() {
    localStorage.setItem('parentalControlSettings', JSON.stringify(this.settings));
    localStorage.setItem('parentalControlLogs', JSON.stringify(this.activityLogs));
    this.sendUpdateToUI();
  }
  
  setupListeners() {
    window.addEventListener('message', (e) => {
      if (typeof e.data === 'string' && e.data.startsWith('p ')) {
        this.handleCommand(e.data.substring(2));
      }
    });
  }
  
  handleCommand(command) {
    const [cmd, ...args] = command.split(' ');
    
    switch(cmd) {
      case 'enable':
        this.enable();
        break;
        
      case 'disable':
        this.disable();
        break;
        
      case 'addUser':
        this.addSupervisedUser(args[0]);
        break;
        
      case 'removeUser':
        this.removeSupervisedUser(args[0]);
        break;
        
      case 'blockApp':
        this.blockApp(args[0]);
        break;
        
      case 'allowApp':
        this.allowApp(args[0]);
        break;
        
      case 'setLimit':
        this.setDailyLimit(args[0], parseInt(args[1]));
        break;
        
      case 'getStatus':
        this.sendStatus();
        break;
        
      case 'getUsers':
        this.sendUsersList();
        break;
        
      case 'getApps':
        this.sendAppsList();
        break;
        
      case 'getLogs':
        this.sendActivityLogs();
        break;
        
      case 'check':
        this.handleCheckCommand(args);
        break;
    }
  }
  
  handleCheckCommand(args) {
    const [userId, checkType] = args;
    
    switch(checkType) {
      case 'time':
        const remaining = this.getRemainingTime(userId);
        this.sendToUI('timeResponse', userId, remaining);
        break;
        
      case 'app-blocked':
        const appName = args[2];
        const isBlocked = this.isAppBlocked(appName);
        this.sendToUI('blockResponse', userId, appName, isBlocked);
        break;
        
      case 'supervision':
        const isSupervised = this.isUserSupervised(userId);
        this.sendToUI('supervisionResponse', userId, isSupervised);
        break;
        
      case 'parental-control':
        const isEnabled = this.settings.enabled;
        this.sendToUI('parentalControlResponse', isEnabled);
        break;
    }
  }
  
  enable() {
    this.settings.enabled = true;
    this.saveSettings();
    this.sendNotificationToAll('Controles parentais ativados');
  }
  
  disable() {
    this.settings.enabled = false;
    this.saveSettings();
    this.sendNotificationToAll('Controles parentais desativados');
  }
  
  addSupervisedUser(userId) {
    if (!this.settings.supervisedUsers.includes(userId)) {
      this.settings.supervisedUsers.push(userId);
      
      if (!this.settings.dailyLimits[userId]) {
        this.settings.dailyLimits[userId] = 120;
        this.settings.defaultLimits[userId] = 120;
      }
      
      this.saveSettings();
      this.sendNotification(userId, 'Você foi adicionado à supervisão parental');
    }
  }
  
  removeSupervisedUser(userId) {
    this.settings.supervisedUsers = this.settings.supervisedUsers.filter(u => u !== userId);
    delete this.settings.dailyLimits[userId];
    delete this.settings.defaultLimits[userId];
    this.saveSettings();
  }
  
  blockApp(appName) {
    if (!this.settings.blockedApps.includes(appName)) {
      this.settings.blockedApps.push(appName);
      this.saveSettings();
    }
  }
  
  allowApp(appName) {
    this.settings.blockedApps = this.settings.blockedApps.filter(a => a !== appName);
    this.saveSettings();
  }
  
  setDailyLimit(userId, minutes) {
    if (this.settings.supervisedUsers.includes(userId)) {
      this.settings.dailyLimits[userId] = minutes;
      this.settings.defaultLimits[userId] = minutes;
      this.saveSettings();
      this.sendNotification(userId, `Seu limite diário foi definido para ${minutes} minutos`);
    }
  }
  
  isUserSupervised(userId) {
    return this.settings.enabled && this.settings.supervisedUsers.includes(userId);
  }
  
  isAppBlocked(appName) {
    return this.settings.blockedApps.includes(appName);
  }
  
  getRemainingTime(userId) {
    return this.settings.dailyLimits[userId] || 0;
  }
  
  logAppUsage(userId, appName, mode) {
    if (this.isUserSupervised(userId)) {
      const log = {
        userId,
        appName,
        mode,
        timestamp: new Date().toISOString()
      };
      
      this.activityLogs.push(log);
      
      if (this.activityLogs.length > 1000) {
        this.activityLogs.shift();
      }
      
      this.saveSettings();
    }
  }
  
  startUsageTimer(userId, appName) {
    if (this.isUserSupervised(userId)) {
      const remaining = this.getRemainingTime(userId);
      
      if (remaining <= 0) {
        this.sendNotification(userId, 'Seu tempo de uso diário acabou!');
        return false;
      }
      
      this.stopUsageTimer(userId);
      
      this.usageTimers[userId] = {
        startTime: Date.now(),
        appName,
        timer: setTimeout(() => {
          this.sendNotification(userId, 'Seu tempo de uso diário está acabando!');
        }, (remaining - 5) * 60 * 1000)
      };
      
      this.logAppUsage(userId, appName, 'iniciado');
      return true;
    }
    return true;
  }
  
  stopUsageTimer(userId) {
    if (this.usageTimers[userId]) {
      const { startTime, appName, timer } = this.usageTimers[userId];
      clearTimeout(timer);
      
      const minutesUsed = Math.floor((Date.now() - startTime) / 60000);
      if (this.settings.dailyLimits[userId]) {
        this.settings.dailyLimits[userId] = Math.max(0, 
          this.settings.dailyLimits[userId] - minutesUsed);
      }
      
      this.logAppUsage(userId, appName, 'encerrado');
      this.saveSettings();
      delete this.usageTimers[userId];
    }
  }
  
  startDailyResetTimer() {
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0
    );
    
    const msUntilMidnight = midnight - now;
    
    setTimeout(() => {
      this.resetDailyLimits();
      this.startDailyResetTimer();
    }, msUntilMidnight);
  }
  
  resetDailyLimits() {
    for (const userId in this.settings.defaultLimits) {
      this.settings.dailyLimits[userId] = this.settings.defaultLimits[userId];
    }
    this.saveSettings();
    this.sendNotificationToAll('Limites diários foram resetados');
  }
  
  sendNotification(userId, message) {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        iframe.contentWindow.postMessage(`parental-notification:${userId}:${message}`, '*');
      } catch (e) {
        console.log('Não foi possível enviar notificação para iframe');
      }
    });
    
    if (window.Notificacao) {
      Notificacao.mostrar('Controle Parental', message);
    }
  }
  
  sendNotificationToAll(message) {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        iframe.contentWindow.postMessage(`parental-notification:all:${message}`, '*');
      } catch (e) {
        console.log('Não foi possível enviar notificação para iframe');
      }
    });
  }
  
  getAvailableUsers() {
    const users = [];
    
    try {
      const physicalUsers = Object.keys(localStorage)
        .filter(key => key.startsWith('user_'))
        .map(key => ({
          id: key,
          name: localStorage.getItem(key) || 'Usuário'
        }));
      
      users.push(...physicalUsers);
    } catch (e) {
      console.error('Erro ao carregar usuários físicos:', e);
    }
    
    try {
      const virtualUsers = Object.keys(localStorage)
        .filter(key => key.startsWith('virtual_user_'))
        .map(key => {
          const data = JSON.parse(localStorage.getItem(key));
          return {
            id: `virtual_${key.split('_')[2]}`,
            name: data.name || 'Usuário Virtual'
          };
        });
      
      users.push(...virtualUsers);
    } catch (e) {
      console.error('Erro ao carregar usuários virtuais:', e);
    }
    
    return users;
  }
  
  sendStatus() {
    const status = {
      enabled: this.settings.enabled,
      supervisedUsers: this.settings.supervisedUsers,
      blockedApps: this.settings.blockedApps,
      dailyLimits: this.settings.dailyLimits
    };
    
    this.sendToUI('status', JSON.stringify(status));
  }
  
  sendUsersList() {
    const users = this.getAvailableUsers();
    const supervisedUsers = this.settings.supervisedUsers;
    
    this.sendToUI('users', 
      JSON.stringify(users), 
      JSON.stringify(supervisedUsers)
    );
  }
  
  sendAppsList() {
    const blockedApps = this.settings.blockedApps;
    
    this.sendToUI('apps', 
      JSON.stringify(this.availableApps), 
      JSON.stringify(blockedApps)
    );
  }
  
  sendActivityLogs() {
    const logs = this.activityLogs.slice(-50);
    const users = this.getAvailableUsers();
    
    this.sendToUI('logs', 
      JSON.stringify(logs), 
      JSON.stringify(users)
    );
  }
  
  sendToUI(type, ...data) {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      iframe.contentWindow.postMessage(`p ${type} ${data.join(' ')}`, '*');
    });
  }
  
  sendUpdateToUI() {
    const users = this.getAvailableUsers();
    const data = {
      status: this.settings.enabled,
      users,
      supervisedUsers: this.settings.supervisedUsers,
      blockedApps: this.settings.blockedApps,
      dailyLimits: this.settings.dailyLimits,
      logs: this.activityLogs.slice(-50)
    };
    
    this.sendToUI('update', JSON.stringify(data));
  }
}

// Inicializa o controle parental
window.parentalControl = new ParentalControl();