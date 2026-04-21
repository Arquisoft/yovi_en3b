// UBICACIÓN: webapp/src/components/TutorBot/TutorBot.tsx
import React, { useState, useEffect } from 'react';
import { Bot, X } from 'lucide-react'; // Import icons from Lucide
import './TutorBox.css'; // Style file

interface TutorBotProps {
    message: string | null; // Message to display
    onClear: () => void; // Function to clear the message
}

// CORRECCIÓN: Se añade onClear aquí en las props
const TutorBot: React.FC<TutorBotProps> = ({ message, onClear }) => {
    const [isOpen, setIsOpen] = useState(false); // Controls if the bubble is open
    const [hasNotification, setHasNotification] = useState(false); // Controls the red dot

    // When a new message arrives, show the notification
    useEffect(() => {
        if (message) {
            setHasNotification(true); // Turn on red badge
        }
    }, [message]);

    const toggleBubble = () => {
        if (!isOpen) {
            setHasNotification(false); // Clear notification dot
            setIsOpen(true); // Open the bubble
        } else {
            setIsOpen(false); // Close it
            onClear(); // Tell GameScreen to reset the message state (NOW IT WORKS)
        }
    };

    // CORRECCIÓN EXTRA: También debemos llamar a onClear si cerramos con la "X"
    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering toggleBubble
        setIsOpen(false);
        onClear(); // Reset state in GameScreen
    };

    if (!message && !isOpen) return null; // Don't show anything if there is no message

    return (
        <div className="tutor-bot-container">
            {isOpen && message && (
                <div className="tutor-bubble">
                    <button className="close-tutor" onClick={handleClose}>
                        <X size={14} /> {/* Close button icon */}
                    </button>
                    <p className="tutor-text">{message}</p>
                    <div className="tutor-arrow"></div> {/* Triangle at bottom */}
                </div>
            )}

            <div className="robot-icon-wrapper" onClick={toggleBubble}>
                <div className="robot-avatar">
                    <Bot size={30} /> {/* Robot icon */}
                </div>
                {hasNotification && !isOpen && (
                    <div className="notification-badge">1</div> // Red notification dot
                )}
            </div>
        </div>
    );
};

export default TutorBot;