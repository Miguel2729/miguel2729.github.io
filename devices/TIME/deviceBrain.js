class TIME {
  static now() {
    try {
      return new Date().toLocaleTimeString();
    } catch (e) {
      console.error("[TIME] Erro ao obter hora:", e.message);
      return "hora-indisponível";
    }
  }

  static date() {
    try {
      return new Date().toLocaleDateString();
    } catch (e) {
      console.error("[TIME] Erro ao obter data:", e.message);
      return "data-indisponível";
    }
  }

  static delay(ms) {
    return new Promise(resolve => {
      try {
        setTimeout(resolve, ms);
      } catch (e) {
        console.error("[TIME] Erro em delay:", e.message);
        resolve();
      }
    });
  }

  static timestamp() {
    try {
      return Date.now();
    } catch (e) {
      console.error("[TIME] Erro ao obter timestamp:", e.message);
      return 0;
    }
  }
}