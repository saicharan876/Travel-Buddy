import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000'); // Adjust if hosted elsewhere

const Chatbox = ({ tripId, userId, receiverId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socket.emit('joinRoom', { roomId: tripId });

    axios.get(`http://localhost:5000/api/chat/${tripId}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error('Failed to load messages:', err));
  }, [tripId]);

  useEffect(() => {
    socket.on('receiveMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  const handleSend = () => {
    if (newMessage.trim() === '') return;

    const messageData = {
      roomId: tripId,
      message: newMessage,
      senderId: userId,
      receiverId,
    };

    socket.emit('sendMessage', messageData);
    setNewMessage('');
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {messages.map((msg, idx) => {
  const isMe = msg.senderId?._id?.toString() === userId.toString();

  return (
    <div key={idx} style={{
      display: 'flex',
      flexDirection: isMe ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    }}>
      {!isMe && msg.senderId?.avatar && (
       <img
            src={msg.senderId?.avatar || ''}
            alt=""
            style={{
            width: msg.senderId?.avatar ? '32px' : '0px',
            height: msg.senderId?.avatar ? '32px' : '0px',
            borderRadius: '50%',
            marginRight: msg.senderId?.avatar ? '0.5rem' : '0',
            objectFit: 'cover',
            transition: '0.3s'
          }}
        />
      )}
      <div style={{ maxWidth: '70%' }}>
        {!isMe && (
          <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '2px' }}>
            {msg.senderId?.name || 'Unknown'}
          </div>
        )}
        <div style={{
          background: isMe ? '#DCF8C6' : '#F1F0F0',
          padding: '8px 12px',
          borderRadius: '16px',
          display: 'inline-block',
          wordWrap: 'break-word'
        }}>
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
