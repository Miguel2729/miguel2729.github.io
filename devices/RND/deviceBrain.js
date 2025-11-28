class RND {
  static getByte() {
    try {
      return Math.floor(Math.random() * 256);
    } catch (e) {
      console.error("[RND] Erro ao gerar byte:", e.message);
      return 0;
    }
  }

  static getInt(max = 100) {
    try {
      return Math.floor(Math.random() * max);
    } catch (e) {
      console.error("[RND] Erro ao gerar inteiro:", e.message);
      return 0;
    }
  }

  static getFloat() {
    try {
      return Math.random();
    } catch (e) {
      console.error("[RND] Erro ao gerar float:", e.message);
      return 0.0;
    }
  }

  static getUUID() {
    try {
      return crypto?.randomUUID?.() || "uuid-não-suportado";
    } catch (e) {
      console.error("[RND] Erro ao gerar UUID:", e.message);
      return "uuid-erro";
    }
  }
}