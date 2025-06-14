import { useState, useEffect, useRef } from 'react';
import SideBar from './Components/Sidebar'; // Your original Sidebar
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
    const [isLoading, setIsLoading] = useState(false); // Added isLoading state
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

    const handleSendMessage = async (eventOrValue) => {
        let messageToSend = '';
        if (typeof eventOrValue === 'string') {
            messageToSend = eventOrValue;
        } else if (eventOrValue && typeof eventOrValue.preventDefault === 'function') {
            eventOrValue.preventDefault();
            messageToSend = inputValue;
        } else {
            messageToSend = inputValue; 
        }

        if (!messageToSend.trim()) return;

        const csrftoken = getCookie('csrftoken');
        if (!csrftoken) {
            console.error("CSRF token not found. Make sure initial GET request to backend sets it.");
            setMessages(prevMessages => [...prevMessages, { text: "Error: CSRF token missing. Please refresh.", is_user: false, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
            return;
        }

        const formData = new FormData();
        formData.append('message', messageToSend);

        const optimisticUserMessage = {
            text: messageToSend,
            is_user: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prevMessages => [...prevMessages, optimisticUserMessage]);
        if (typeof eventOrValue !== 'string') {
             setInputValue('');
             setCharCount(0); // Reset char count as well
        }
        
        setIsLoading(true); // Set loading to true before sending

        try {
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
            setMessages(prevMessages => [...prevMessages, { text: data.response, is_user: false, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prevMessages => [...prevMessages, { text: "Sorry, I couldn't connect to the AI. Please try again.", is_user: false, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        } finally {
            setIsLoading(false); // Set loading to false after response or error
        }
    };

    const handleNewChat = () => {
        setMessages([]); // Clear current messages
        setInputValue(''); // Clear input field
        setCharCount(0); // Reset character count
        // Optionally, you could also send a signal to the backend to reset conversation history there
        console.log("New chat started");
        // fetchChatData(); // Or fetch any initial message if your backend supports it for a new chat
    };

    return (
        <>
            <SideBar handleNewChat={handleNewChat} />
            <MainBar
                messages={messages}
                inputValue={inputValue}
                charCount={charCount}
                onInputChange={handleInputChange}
                onSendMessage={handleSendMessage}
                isLoading={isLoading} // Pass isLoading state
            />
        </>
    );
}

export default App;