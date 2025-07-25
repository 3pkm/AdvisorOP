import { useState, useEffect, useRef } from 'react';
import MainBar from './Components/Mainbar';   // Your original Mainbar
import './App.css'; // Assuming you have some basic styling

// Helper function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const API_BASE_URL = 'http://localhost:8000'; // Your Django backend URL

function App() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [charCount, setCharCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const chatHistoryRef = useRef(null);

    // Fetch initial chat data and ensure CSRF cookie is set
    const fetchChatData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/talk/`, {
                credentials: 'include', // Ensure cookies are sent/received for GET
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setMessages(data.messages || []);
            setCharCount(data.char_count || 0);
        } catch (error) {
            console.error("Failed to fetch chat data:", error);
            // Add a default error message for the user
            setMessages([{ text: "Error: Could not connect to the chat service.", is_user: false, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        }
    };

    useEffect(() => {
        fetchChatData();
    }, []);

    // Scroll to bottom of chat history when messages change
    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [messages]);

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleSendMessage = async (messageToSend) => {
        if (!messageToSend.trim()) return;

        const csrftoken = getCookie('csrftoken');
        if (!csrftoken) {
            console.error("CSRF token not found. Make sure initial GET request to backend sets it.");
            setMessages(prevMessages => [...prevMessages, { text: "Error: CSRF token missing. Please refresh.", is_user: false, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
            return;
        }

        // Add user message immediately
        const optimisticUserMessage = {
            text: messageToSend,
            is_user: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prevMessages => [...prevMessages, optimisticUserMessage]);
        
        // Clear input immediately after sending
        setInputValue('');
        setCharCount(0);
        
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('message', messageToSend);

            const response = await fetch(`${API_BASE_URL}/talk/`, {
                method: 'POST',
                headers: { 'X-CSRFToken': csrftoken },
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Add AI response immediately when received
            const aiMessage = {
                text: data.response,
                is_user: false,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prevMessages => [...prevMessages, aiMessage]);
            
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prevMessages => [...prevMessages, { 
                text: "Sorry, I couldn't connect to the AI. Please try again.", 
                is_user: false, 
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = async () => {
        try {
            const csrftoken = getCookie('csrftoken');
            if (!csrftoken) {
                console.error("CSRF token not found for new chat request.");
                // Still clear the frontend even if we can't call backend
                setMessages([]);
                setInputValue('');
                setCharCount(0);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/new-chat/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                setMessages([]); // Clear current messages
                setInputValue(''); // Clear input field
                setCharCount(0); // Reset character count
                console.log("New chat started");
            } else {
                console.error("Failed to start new chat:", response.status);
                // Still clear the frontend
                setMessages([]);
                setInputValue('');
                setCharCount(0);
            }
        } catch (error) {
            console.error("Failed to start new chat:", error);
            // Still clear the frontend even if backend call fails
            setMessages([]);
            setInputValue('');
            setCharCount(0);
        }
    };

    return (
        <>
            <MainBar
                messages={messages}
                inputValue={inputValue}
                charCount={charCount}
                onInputChange={handleInputChange}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                onNewChat={handleNewChat}
            />
        </>
    );
}

export default App;