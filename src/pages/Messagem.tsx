import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Home } from 'lucide-react';
import jwt_decode from 'jwt-decode';  

export default function Messages() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [message, setMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const token = localStorage.getItem('token');
  let senderId = null;

  if (token) {
    const decodedToken = jwt_decode(token);
    senderId = decodedToken.id;  
  }

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await axios.get('http://localhost:3000/api/messages/users', {
          params: { userId: senderId }
        });
        setUsers(response.data);
        console.log('Utilizador carregados:', response.data);
      } catch (error) {
        console.error('Erro ao buscar Utilizador:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    if (senderId) {
      fetchUsers();
    }
  }, [senderId]);

  const handleUserClick = async (userId) => {
    setSelectedUser(userId);
    setLoadingMessages(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/messages/conversation/${senderId}`, {
        params: { senderId: userId },
      });
      setMessages(response.data);

      const userResponse = await axios.get(`http://localhost:3000/api/users/${userId}`);
      setSelectedUserName(userResponse.data.name);
      console.log('Nome do Utilizador selecionado:', userResponse.data.name);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await axios.post('http://localhost:3000/message', {
        senderId: senderId,
        receiverId: selectedUser,
        content: message,
      });

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content: message,
          senderId,
          receiverId: selectedUser,
          createdAt: new Date(),
        },
      ]);
      setMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleCloseConversation = () => {
    setSelectedUser(null);
   
  };


  const handleCloseConversation2 = () => {
    setSelectedUser(null);
    window.location.href = "/"; // Redireciona para a página inicial
  };

  useEffect(() => {
    let intervalId;
    if (selectedUser) {
      intervalId = setInterval(async () => {
        setLoadingMessages(true);
        try {
          const response = await axios.get(`http://localhost:3000/api/messages/conversation/${senderId}`, {
            params: { senderId: selectedUser },
          });
          setMessages(response.data);
        } catch (error) {
          console.error('Erro ao buscar mensagens durante o refresh:', error);
        } finally {
          setLoadingMessages(false);
        }
      }, 5000); 

     
      return () => clearInterval(intervalId);
    }
  }, [selectedUser, senderId]);

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
    
      <div className="w-1/4 p-6 shadow-lg flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold text-center text-blue-600">Mensagens</h2>
        
          <button
  className="text-blue-600 hover:text-blue-800 p-2 rounded-full bg-gray-200 hover:bg-gray-300 ml-[200px]"
  onClick={() => window.location.href = '/'}
>
  <Home size={24} /> {/* Ícone de voltar à página inicial */}

</button>

            <div className="relative">
           
             
                <div
                  className={`w-6 h-6 bg-white rounded-full transform ${isDarkMode ? 'translate-x-6' : ''} transition-transform`}
                />
              
            </div>
         
        </div>

        {loadingUsers ? (
          <p className="text-center">A carregar utilizadores...</p>
        ) : (
          <div className="space-y-4 flex-grow">
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded-md"
                  onClick={() => handleUserClick(user.id)}
                >
                  <User size={24} className="text-gray-600" />
                  <span className="text-lg font-medium">{user.name}</span>
                </div>
              ))
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-center text-gray-500">Ainda Não tens mensagens</p>
              </div>
            )}
          </div>
        )}
      </div>

     
      {selectedUser && (
        <div className={`w-3/4 p-6 shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <div className="border-b-2 border-blue-600 mb-4 pb-2 flex justify-between items-center">
            <h2 className="text-3xl font-semibold text-center text-blue-600">
              Conversação com <span className="text-black">{selectedUserName}</span>
            </h2>
            <button
              className="text-red-600 hover:text-red-800"
              onClick={handleCloseConversation}
            >
              Fechar
            </button>
          </div>
          {loadingMessages ? (
            <p className="text-center">A carregar mensagens...</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.senderId === senderId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-lg ${msg.senderId === senderId ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {msg.senderId === senderId ? 'Tu: ' : 'Ele: '}
                      {msg.content}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center">Nenhuma mensagem encontrada.</p>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center">
            <textarea
              className={`w-full p-4 border border-gray-300 rounded-md resize-none ${isDarkMode ? 'text-black' : ''}`}
              placeholder="Digite a sua mensagem"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              className="ml-4 bg-blue-600 text-white p-4 rounded-md hover:bg-blue-700 transition-colors"
              onClick={handleSendMessage}
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
