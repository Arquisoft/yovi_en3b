# Guía de Internacionalización (i18n)

Este documento explica cómo mantener y expandir el sistema de internacionalización en la aplicación.

## 📁 Estructura

```
src/
├── i18n/
│   ├── locales.ts       ← Todas las traducciones (ES + EN)
│   ├── config.ts        ← Configuración de idiomas
│   ├── useTranslation.ts ← Hook custom useI18n()
│   └── Provider.tsx     ← Proveedor de contexto
├── components/
│   ├── MainMenu.tsx
│   ├── GameScreen/
│   │   └── GameScreen.tsx
│   └── UserProfile/
│       └── ProfileOverlay.tsx
└── main.tsx            ← I18nProvider envuelve la app
```

## 🚀 Pasos para Crear un Nuevo Componente con i18n

### 1. **Agregar las traducciones a `src/i18n/locales.ts`**

Antes de crear el componente, define todas las claves que necesitarás:

```typescript
// src/i18n/locales.ts

export const translations = {
  es: {
    buttons: {
      // ... traducciones existentes
      myNewButton: 'MI NUEVO BOTÓN',
    },
    labels: {
      // ... traducciones existentes
      myNewLabel: 'MI NUEVA ETIQUETA',
    },
    messages: {
      // ... traducciones existentes
      myNewMessage: 'Mi nuevo mensaje',
    },
  },
  en: {
    buttons: {
      // ... traducciones existentes
      myNewButton: 'MY NEW BUTTON',
    },
    labels: {
      // ... traducciones existentes
      myNewLabel: 'MY NEW LABEL',
    },
    messages: {
      // ... traducciones existentes
      myNewMessage: 'My new message',
    },
  },
};
```

### 2. **Crear el Componente TSX**

Importa el hook `useI18n` y úsalo:

```typescript
// src/components/MyNewComponent/MyNewComponent.tsx

import React from 'react';
import { useI18n } from '../../i18n/useTranslation';
import './MyNewComponent.css';

interface MyNewComponentProps {
  onClose?: () => void;
}

const MyNewComponent: React.FC<MyNewComponentProps> = ({ onClose }) => {
  const { t, language, setLanguage } = useI18n();
  
  return (
    <div className="my-component">
      <h1>{t.labels.myNewLabel}</h1>
      <p>{t.messages.myNewMessage}</p>
      
      <button onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}>
        {t.buttons.myNewButton}
      </button>
      
      {onClose && (
        <button onClick={onClose}>Cerrar</button>
      )}
    </div>
  );
};

export default MyNewComponent;
```

### 3. **Verificar Autocompletado TypeScript**

Cuando escribas `t.`, el editor te sugerirá automáticamente:
- `t.buttons.*`
- `t.labels.*`
- `t.messages.*`

Esto garantiza que **no habrá errores de traducción** en tiempo de compilación.

## 📋 Anatomía del Hook `useI18n()`

```typescript
const { t, language, setLanguage } = useI18n();

// t         → objeto con todas las traducciones del idioma actual
// language  → idioma actual ('es' | 'en')
// setLanguage → función para cambiar idioma
```

---

## 🎯 Casos de Uso Comunes

### Caso 1: Componente Simple con Botones y Etiquetas

```typescript
import React from 'react';
import { Settings } from 'lucide-react';
import { useI18n } from '../../i18n/useTranslation';

const SettingsPanel: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="settings-panel">
      <h2>{t.buttons.settings}</h2>
      <label>{t.labels.displayName}</label>
      <input type="text" placeholder={t.labels.displayName} />
      <button>{t.buttons.save}</button>
    </div>
  );
};

export default SettingsPanel;
```

### Caso 2: Componente con Cambio de Idioma

```typescript
import React from 'react';
import { Languages } from 'lucide-react';
import { useI18n } from '../../i18n/useTranslation';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useI18n();

  return (
    <button 
      className="language-btn"
      title={t.labels.language}
      onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
    >
      <Languages size={24} />
      <span>{language.toUpperCase()}</span>
    </button>
  );
};

export default LanguageSwitcher;
```

### Caso 3: Componente Modal con Validación

```typescript
import React, { useState } from 'react';
import { useI18n } from '../../i18n/useTranslation';

const UserFormModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useI18n();
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim() === '') {
      alert(t.messages.usernameMustBeCompleted);
      return;
    }
    // Lógica de guardado...
  };

  return (
    <div className="modal">
      <h2>{t.labels.userProfile}</h2>
      <input 
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t.labels.displayName}
      />
      <button onClick={handleSubmit}>{t.buttons.save}</button>
      <button onClick={onClose}>{t.buttons.exit}</button>
    </div>
  );
};

export default UserFormModal;
```

---

## ✅ Checklist para Nuevos Componentes

Cuando crees un nuevo componente, asegúrate de:

- [ ] Agregar todas las claves de traducción en `src/i18n/locales.ts` (español e inglés)
- [ ] Importar `useI18n` desde `'../../i18n/useTranslation'`
- [ ] Usar `const { t, language, setLanguage } = useI18n();`
- [ ] Reemplazar todos los strings hardcodeados con `t.categoria.clave`
- [ ] Verificar que TypeScript sugiera las claves correctamente
- [ ] Probar que el cambio de idioma funciona correctamente

## 🔄 Flujo de Traducción

1. **Usuario abre la app** → Se carga idioma desde localStorage (o español por defecto)
2. **Se renderiza componente** → Hook `useI18n()` obtiene traducciones del idioma actual
3. **Usuario cambia idioma** → `setLanguage()` actualiza el contexto
4. **Se re-renderizan componentes** → Todos reciben nuevas traducciones automáticamente

## 📝 Ejemplo Completo: Nuevo Componente `HowToPlayModal`

### 1. Agregar traducciones

```typescript
// En src/i18n/locales.ts, dentro de cada idioma:

es: {
  labels: {
    howToPlay: 'CÓMO JUGAR',
    gameRules: 'Reglas del Juego',
    objectives: 'Objetivos',
    controls: 'Controles',
  },
  messages: {
    moveDescription: 'Mueve tus fichas de forma estratégica.',
    winCondition: 'Sé el primer jugador en alcanzar el centro.',
  },
}

en: {
  labels: {
    howToPlay: 'HOW TO PLAY',
    gameRules: 'Game Rules',
    objectives: 'Objectives',
    controls: 'Controls',
  },
  messages: {
    moveDescription: 'Move your pieces strategically.',
    winCondition: 'Be the first player to reach the center.',
  },
}
```

### 2. Crear el componente

```typescript
// src/components/HowToPlayModal/HowToPlayModal.tsx

import React from 'react';
import { X } from 'lucide-react';
import { useI18n } from '../../i18n/useTranslation';
import './HowToPlayModal.css';

interface HowToPlayModalProps {
  onClose: () => void;
}

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const { t } = useI18n();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content how-to-play" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose}>
          <X size={28} />
        </button>

        <h2 className="modal-title">{t.labels.howToPlay}</h2>

        <section>
          <h3>{t.labels.gameRules}</h3>
          <p>{t.messages.moveDescription}</p>
        </section>

        <section>
          <h3>{t.labels.objectives}</h3>
          <p>{t.messages.winCondition}</p>
        </section>

        <button className="main-button" onClick={onClose}>
          {t.buttons.exit}
        </button>
      </div>
    </div>
  );
};

export default HowToPlayModal;
```

### 3. Usar el componente

```typescript
// En cualquier otro componente:
import HowToPlayModal from '../HowToPlayModal/HowToPlayModal';

const MyComponent = () => {
  const [showHowTo, setShowHowTo] = useState(false);
  const { t } = useI18n();

  return (
    <>
      <button onClick={() => setShowHowTo(true)}>
        {t.buttons.howToPlay}
      </button>

      {showHowTo && (
        <HowToPlayModal onClose={() => setShowHowTo(false)} />
      )}
    </>
  );
};
```

---

## 🐛 Solución de Problemas

### "El hook debe estar dentro del Provider"
```
Error: useI18n must be used within I18nProvider
```
**Solución:** Asegúrate de que el componente está dentro del árbol de `<I18nProvider>` en `main.tsx`.

### "TypeScript no sugiere mis nuevas claves"
**Solución:** Asegúrate de:
1. Agregar las claves en AMBOS idiomas (es + en) en `locales.ts`
2. Guardar el archivo
3. Hacer un rebuild del proyecto

### "El cambio de idioma no se refleja"
**Solución:** Verifica que:
1. Estés usando `const { t } = useI18n()` (no una copia estática)
2. El componente se renderice dentro del Provider

---

## 📚 Resumen Rápido

| Tarea | Archivo |
|-------|---------|
| Agregar traducción | `src/i18n/locales.ts` |
| Importar hook | `import { useI18n } from '../../i18n/useTranslation'` |
| Usar traducción | `t.categoria.clave` |
| Cambiar idioma | `setLanguage('es')` o `setLanguage('en')` |
| Leer idioma actual | `language` |

**¡Listo! Ya puedes crear componentes multiidioma sin problemas.** 🌍
