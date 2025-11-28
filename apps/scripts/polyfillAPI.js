// Verifica se o objeto global já existe para evitar sobrescrever
if (typeof window.PolyfillAPI === 'undefined') {
  (function() {
    'use strict';
    
    // Cria o objeto global PolyfillAPI
    window.PolyfillAPI = {
      // Armazena os polyfills registrados
      _polyfills: {},
      
      /**
       * Registra um novo polyfill
       * @param {string} name - Nome da API/funcionalidade a ser polyfilled
       * @param {function} factory - Função que implementa o polyfill
       */
      register: function(name, factory) {
        if (typeof name !== 'string') {
          throw new Error('Polyfill name must be a string');
        }
        
        if (typeof factory !== 'function') {
          throw new Error('Polyfill factory must be a function');
        }
        
        this._polyfills[name] = factory;
      },
      
      /**
       * Aplica um polyfill registrado
       * @param {string} name - Nome do polyfill a ser aplicado
       * @param {object} [target] - Objeto alvo onde o polyfill será aplicado (padrão: window)
       */
      apply: function(name, target) {
        target = target || window;
        
        if (!this._polyfills[name]) {
          throw new Error(`Polyfill "${name}" not registered`);
        }
        
        this._polyfills[name](target);
      },
      
      /**
       * Verifica se um polyfill está registrado
       * @param {string} name - Nome do polyfill
       * @returns {boolean}
       */
      has: function(name) {
        return !!this._polyfills[name];
      },
      
      /**
       * Aplica todos os polyfills registrados
       * @param {object} [target] - Objeto alvo (padrão: window)
       */
      applyAll: function(target) {
        target = target || window;
        
        for (var name in this._polyfills) {
          if (this._polyfills.hasOwnProperty(name)) {
            this._polyfills[name](target);
          }
        }
      }
    };
    
    // Polyfills básicos (exemplos)
    
    // Polyfill para Object.entries (para navegadores mais antigos)
    PolyfillAPI.register('Object.entries', function(target) {
      if (!target.Object.entries) {
        target.Object.entries = function(obj) {
          var ownProps = Object.keys(obj),
              i = ownProps.length,
              resArray = new Array(i);
          
          while (i--) {
            resArray[i] = [ownProps[i], obj[ownProps[i]]];
          }
          
          return resArray;
        };
      }
    });
    
    // Polyfill para Element.closest (para IE)
    PolyfillAPI.register('Element.closest', function(target) {
      if (!target.Element.prototype.closest) {
        target.Element.prototype.closest = function(selector) {
          var el = this;
          while (el) {
            if (el.matches(selector)) {
              return el;
            }
            el = el.parentElement;
          }
          return null;
        };
      }
    });
    
    // Polyfill para String.padStart (para IE)
    PolyfillAPI.register('String.padStart', function(target) {
      if (!target.String.prototype.padStart) {
        target.String.prototype.padStart = function(maxLength, fillString) {
          if (this.length >= maxLength) return String(this);
          
          fillString = fillString || ' ';
          var fillLen = maxLength - this.length;
          var timesToRepeat = Math.ceil(fillLen / fillString.length);
          var truncatedString = fillString
            .repeat(timesToRepeat)
            .slice(0, fillLen);
          
          return truncatedString + String(this);
        };
      }
    });
    
    // Aplica automaticamente os polyfills básicos
    PolyfillAPI.applyAll();
    
  })();
}