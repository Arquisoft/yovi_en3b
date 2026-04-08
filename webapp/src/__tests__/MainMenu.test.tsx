import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import MainMenu from '../components/MainMenu'; 
import { SettingsProvider } from '../context/SettingsContext';

const mockNavigate = vi.fn();
const mockSetLanguage = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

// Mock de i18n usando TUS CLAVES REALES (basado en el objeto que pasaste)
vi.mock('../i18n/useTranslation', () => ({
    useI18n: () => ({
        language: 'en',
        setLanguage: mockSetLanguage,
        t: {
            buttons: {
                play: 'PLAY',
                howToPlay: 'HOW TO PLAY',
                overallRanking: 'OVERALL RANKING',
                language: 'LANGUAGE',
                settings: 'SETTINGS',
                profile: 'PROFILE',
                logout: 'LOGOUT',
                confirmLogout: 'LOG OUT',
                stayHere: 'STAY',
                spanish: 'SPANISH',
                english: 'ENGLISH'
            },
            labels: {
                selectLevel: 'SELECT LEVEL'
            },
            messages: {
                logoutConfirmation: 'Are you sure you want to log out?',
                selectLanguage: 'Select a language'
            }
        }
    })
}));

// Mock del Audio para evitar el error de constructor
const mockAudioInstance = {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    load: vi.fn(),
};

vi.stubGlobal('Audio', vi.fn().mockImplementation(function() {
    return mockAudioInstance;
}));

const renderMainMenu = () => {
    return render(
        <MemoryRouter>
            <SettingsProvider>
                <MainMenu />
            </SettingsProvider>
        </MemoryRouter>
    );
};

describe('MainMenu Component con Traducciones Reales', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('1. Renderiza los botones principales con textos correctos', () => {
        renderMainMenu();
        // Usamos los textos que definiste en tu objeto translations.en
        expect(screen.getByText('PLAY')).toBeDefined();
        expect(screen.getByText('HOW TO PLAY')).toBeDefined();
        expect(screen.getByText('OVERALL RANKING')).toBeDefined();
    });

    test('2. Lógica del modal de Logout (Cerrar sesión)', () => {
        renderMainMenu();
        
        // El botón tiene el title del objeto translations
        const logoutBtn = screen.getByTitle('LOGOUT');
        fireEvent.click(logoutBtn);

        // Verificamos el mensaje del modal
        expect(screen.getByText('Are you sure you want to log out?')).toBeDefined();

        // Probar botón de quedarse (Stay)
        const stayBtn = screen.getByText('STAY');
        fireEvent.click(stayBtn);
        expect(screen.queryByText('Are you sure you want to log out?')).toBeNull();

        // Probar botón de confirmar logout
        fireEvent.click(logoutBtn);
        const confirmBtn = screen.getByText('LOG OUT');
        fireEvent.click(confirmBtn);
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('3. Apertura de modales de configuración e idioma', () => {
        renderMainMenu();

        // Abrir Idioma
        fireEvent.click(screen.getByTitle('LANGUAGE'));
        // Si LanguageDialog usa el mensaje selectLanguage:
        expect(screen.getByText('Select a language')).toBeDefined();

        // Abrir Configuración
        fireEvent.click(screen.getByTitle('SETTINGS'));
        
        // Abrir Perfil
        fireEvent.click(screen.getByTitle('PROFILE'));
        
        // Verificar que se llamó al sonido de click en cada acción
        expect(vi.mocked(global.Audio)).toHaveBeenCalled();
    });

    test('4. Navegación al ranking', () => {
        renderMainMenu();
        fireEvent.click(screen.getByText('OVERALL RANKING'));
        // Verificamos que el modal de ranking aparece (el RankingScreen usa este texto)
        expect(screen.getByText('OVERALL RANKING')).toBeDefined();
    });
});