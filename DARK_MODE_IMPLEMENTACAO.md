# 🌓 Dark Mode - Implementação Navbar

## Funcionalidades Implementadas

### ✅ **Toggle Light/Dark Mode**
- **Localização**: Botão circular no navbar, à esquerda do perfil
- **Ícones dinâmicos**: 
  - 🌙 Lua quando em **Light Mode** (clique para ativar dark)
  - ☀️ Sol quando em **Dark Mode** (clique para ativar light)

### ✅ **Detecção Automática do Sistema**
O tema é inicializado automaticamente baseado em:
1. **Preferência salva** no `localStorage` (prioridade máxima)
2. **Preferência do SO** via `prefers-color-scheme: dark`

### ✅ **Persistência de Preferência**
- Escolha do usuário é salva em `localStorage` como `'theme': 'dark' | 'light'`
- Preferência persiste mesmo após fechar o navegador

### ✅ **Sincronização com Sistema Operacional**
- Se usuário **não tiver preferência salva**, acompanha mudanças do SO em tempo real
- Listener para `(prefers-color-scheme: dark)` atualiza automaticamente

---

## 🎨 Variáveis CSS (Design System)

### **Navbar Específico**
```css
--navbar-bg             /* Fundo do navbar */
--navbar-border         /* Borda inferior */
--theme-toggle-bg       /* Fundo do botão */
--theme-toggle-color    /* Cor do ícone */
--theme-toggle-hover-bg /* Hover do botão */
--profile-hover-bg      /* Hover do profile */
--text-primary          /* Texto principal */
--text-secondary        /* Texto secundário */
--dropdown-bg           /* Fundo do dropdown */
--dropdown-border       /* Borda do dropdown */
--dropdown-item-hover   /* Hover dos itens */
--dropdown-divider      /* Divisória */
```

### **Global (styles.scss)**
```css
--bg-primary            /* Fundo primário */
--bg-secondary          /* Fundo secundário */
--bg-tertiary           /* Fundo terciário */
--text-primary          /* Texto principal */
--text-secondary        /* Texto secundário */
--text-tertiary         /* Texto terciário */
--border-color          /* Cor de bordas */
--shadow-sm/md/lg       /* Sombras */
```

---

## 🔧 Arquitetura Técnica

### **Signals (Angular 17+)**
```typescript
isDarkMode = signal(false);  // Estado reativo do tema
```

### **Effects**
```typescript
effect(() => {
  this.applyTheme(this.isDarkMode());
});
// Reage automaticamente a mudanças no signal
```

### **Lifecycle Hooks**
```typescript
ngOnInit() {
  this.initializeTheme();
  // Detecta tema do sistema
  // Registra listener para mudanças
}
```

---

## 🚀 Como Usar

### **Usuário Final**
1. Clique no botão 🌙/☀️ no navbar
2. Tema muda instantaneamente
3. Preferência é salva automaticamente

### **Desenvolvedor - Estender Dark Mode**
```scss
/* Em qualquer componente */
.my-component {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

/* Ou usar a classe .dark-mode */
body.dark-mode .my-component {
  background: #1f2937;
}
```

---

## 📋 Checklist de Qualidade

✅ **Acessibilidade**
- `aria-label` dinâmico no botão
- `title` para tooltip informativo

✅ **Performance**
- CSS Variables evitam re-renders desnecessários
- Transition suaves (0.3s ease)

✅ **UX**
- Animação de scale no hover (1.05x)
- Feedback visual no click (0.95x)
- Ícones intuitivos (lua/sol)

✅ **Persistência**
- localStorage mantém preferência
- Sincronização com SO

✅ **Responsividade**
- Funciona em mobile/desktop
- Botão mantém tamanho fixo (40px)

---

## 🎯 Comportamentos Esperados

### **Cenário 1: Primeira Visita (sem preferência salva)**
```
Sistema operacional em Dark Mode → App inicia em Dark Mode
Sistema operacional em Light Mode → App inicia em Light Mode
```

### **Cenário 2: Usuário com Preferência Salva**
```
localStorage: 'dark' → App sempre inicia em Dark Mode
localStorage: 'light' → App sempre inicia em Light Mode
(Ignora preferência do SO)
```

### **Cenário 3: Mudança no SO (sem preferência salva)**
```
Usuário muda SO de Light → Dark → App acompanha automaticamente
```

### **Cenário 4: Mudança no SO (com preferência salva)**
```
Usuário muda SO de Light → Dark → App mantém preferência do usuário
```

---

## 🔍 Debugging

### **Verificar Tema Atual**
```javascript
// No console do navegador
localStorage.getItem('theme')  // 'dark' | 'light' | null
```

### **Verificar Preferência do SO**
```javascript
window.matchMedia('(prefers-color-scheme: dark)').matches  // true/false
```

### **Resetar Preferência**
```javascript
localStorage.removeItem('theme')
location.reload()  // App seguirá preferência do SO
```

---

## 🎨 Paleta de Cores

### **Light Mode**
- Background: `#ffffff`, `#f9fafb`, `#f3f4f6`
- Text: `#111827`, `#6b7280`, `#9ca3af`
- Border: `#e5e7eb`

### **Dark Mode**
- Background: `#111827`, `#1f2937`, `#374151`
- Text: `#f9fafb`, `#d1d5db`, `#9ca3af`
- Border: `#374151`

---

## 📚 Referências

- **Angular Signals**: Reactive state management
- **CSS Variables**: Dynamic theming
- **prefers-color-scheme**: System preference detection
- **localStorage**: Client-side persistence

**Status**: ✅ **Totalmente Implementado e Testado**

