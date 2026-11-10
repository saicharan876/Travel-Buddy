import React, { useEffect, useState, useRef, useContext } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const SERVER_URL = 'http://localhost:5000';

function senderIdOf(msg) {
  if (!msg.senderId) {
    return null;
  }
  if (typeof msg.senderId === 'object') {
    return msg.senderId._id;
  }
  return msg.senderId;
}

const Chatbox = ({ tripId, userId }) => {
  const { token } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatError, setChatError] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    axios
      .get(`${SERVER_URL}/api/chat/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMessages(res.data))
      .catch(() => setChatError('Could not load old messages.'));

    const socket = io(SERVER_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinRoom', { roomId: tripId });
    });
    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on('chatError', (err) => {
      setChatError(err.message);
    });
    socket.on('connect_error', () => {
      setChatError('Could not connect to chat. Please log in again.');
    });

    return () => {
      socket.disconnect();
    };
  }, [tripId, token]);

  const handleSend = () => {
    if (newMessage.trim() === '' || !socketRef.current) {
      return;
    }
    socketRef.current.emit('sendMessage', { roomId: tripId, message: newMessage });
    setNewMessage('');
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
      {chatError && (
        <div className="chat-error" style={{ color: '#b91c1c', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          {chatError}
        </div>
      )}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {messages.map((msg, idx) => {
          const isMe = senderIdOf(msg) === userId;
          return (
            <div
              key={msg._id || idx}
              className={isMe ? 'chat-message mine' : 'chat-message'}
              style={{
                display: 'flex',
                flexDirection: isMe ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                marginBottom: '1rem',
              }}
            >
              <div style={{ maxWidth: '70%' }}>
                {!isMe && (
                  <div className="chat-sender" style={{ fontSize: '0.75rem', color: '#888', marginBottom: '2px' }}>
                    {msg.senderId?.name || 'Unknown'}
                  </div>
                )}
                <div
                  style={{
                    background: isMe ? '#DCF8C6' : '#F1F0F0',
                    padding: '8px 12px',
                    borderRadius: '16px',
                    display: 'inline-block',
                    wordWrap: 'break-word',
                  }}
                >
                  {msg.message}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: 'flex', marginTop: '1rem' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '0.5rem', borderRadius: '20px', border: '1px solid #ccc' }}
        />
        <button onClick={handleSend} style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem', borderRadius: '20px' }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbox;
