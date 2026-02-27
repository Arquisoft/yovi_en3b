import { useRef, useState } from "react";

type EditableFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
  helperText?: string;
};

// SVG del lápiz
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#60a5fa"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: '18px', height: '18px', filter: 'drop-shadow(0 0 3px rgba(96, 165, 250, 0.5))' }}
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// SVG del tick
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#60a5fa"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ 
      width: '18px', 
      height: '18px', 
      filter: 'drop-shadow(0 0 4px rgba(96, 165, 250, 0.6))',
      animation: 'checkPop 0.3s ease-out'
    }}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Estilos inline para evitar conflictos
const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    position: 'relative',
    width: '100%',
  },
  input: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: '1rem',
    fontWeight: 500,
    color: '#ffffff',
    background: 'transparent',
    border: 'none',
    width: '100%',
    padding: '0 40px 0 0',
    margin: 0,
    outline: 'none',
  },
  iconButton: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '32px',
    height: '32px',
    padding: 0,
    margin: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
    zIndex: 3,
    borderRadius: '8px',
  },
  iconButtonHover: {
    background: 'rgba(96, 165, 250, 0.15)',
  },
  label: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.7rem',
    fontWeight: 500,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    color: '#64748b',
    display: 'block',
    marginBottom: '4px',
  },
  helperText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '6px',
  },
};

export function EditableField({ 
  label, 
  value, 
  onChange, 
  maxLength = 20,
  placeholder = "Enter name...",
  helperText = "Editable nickname shown in the UI."
}: EditableFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showConfirmTick, setShowConfirmTick] = useState(false);
  const [isHoveringIcon, setIsHoveringIcon] = useState(false);

  const handleEditClick = () => {
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowConfirmTick(false);
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value.trim().length > 0) {
      setShowConfirmTick(true);
    }
  };

  const handleConfirmClick = () => {
    setShowConfirmTick(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  const showEditIcon = !isFocused && !showConfirmTick;
  const showCheckIcon = !isFocused && showConfirmTick;

  return (
    <div className="profile-row editable">
      <span style={styles.label}>{label}</span>
      
      <div style={styles.wrapper}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          placeholder={placeholder}
          style={styles.input}
          autoComplete="off"
          spellCheck="false"
        />
        
        {showEditIcon && (
          <button
            type="button"
            onClick={handleEditClick}
            aria-label="Edit"
            style={{
              ...styles.iconButton,
              ...(isHoveringIcon ? styles.iconButtonHover : {}),
            }}
            onMouseEnter={() => setIsHoveringIcon(true)}
            onMouseLeave={() => setIsHoveringIcon(false)}
          >
            <EditIcon />
          </button>
        )}
        
        {showCheckIcon && (
          <button
            type="button"
            onClick={handleConfirmClick}
            aria-label="Confirm"
            style={{
              ...styles.iconButton,
              ...(isHoveringIcon ? styles.iconButtonHover : {}),
            }}
            onMouseEnter={() => setIsHoveringIcon(true)}
            onMouseLeave={() => setIsHoveringIcon(false)}
          >
            <CheckIcon />
          </button>
        )}
      </div>
      
      <div style={styles.helperText}>{helperText}</div>
    </div>
  );
}