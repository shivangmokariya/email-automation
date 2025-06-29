import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import { Menu, ChevronLeft, ChevronRight, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { io as socketIOClient } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const ChatWithAI = () => {
  const { user } = useAuth();
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [recentChats, setRecentChats] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatSkip, setChatSkip] = useState(0);
  const [chatHasMore, setChatHasMore] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const chatLimit = 20;
  const messagesEndRef = useRef(null);
  const chatListRef = useRef(null);
  const [deleteChatId, setDeleteChatId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [showGreeting, setShowGreeting] = useState(true);
  const lastCreatedChatId = useRef(null);

  console.log(openMenuId,"<<<openMenuId")
  useEffect(() => {
    setRecentChats([]);
    setChatSkip(0);
    setChatHasMore(true);
    fetchRecentChats(0, true);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Restore chatId from localStorage only on initial load
    const storedChatId = localStorage.getItem('currentChatId');
    if (
      storedChatId &&
      recentChats.some(
        c => c._id === storedChatId && c.description && c.description.trim() !== '' && c.description !== '(New chat)'
      )
    ) {
      setChatId(storedChatId);
      handleSelectChat(storedChatId);
    }
  }, [recentChats]);

  useEffect(() => {
    // Remove empty chats, but NOT the currently active chat
    recentChats.forEach((chat) => {
      if (
        (!chat.description || chat.description.trim() === '' || chat.description === '(New chat)') &&
        chat._id !== chatId &&
        chat._id !== lastCreatedChatId.current // Don't delete the just-created chat
      ) {
        api.delete(`/emails/ai/empty-chat/${chat._id}`);
      }
    });
  }, [recentChats, chatId]);

  const fetchRecentChats = async (skip = chatSkip, initial = false) => {
    if (chatLoading || (!initial && !chatHasMore)) return;
    setChatLoading(true);
    try {
      const { data } = await api.get(`/emails/ai/recent-chats?skip=${skip}&limit=${chatLimit}`);
      if (initial) {
        setRecentChats(data.data);
      } else {
        setRecentChats((prev) => [...prev, ...data.data.filter(chat => !prev.some(c => c._id === chat._id))]);
      }
      setChatSkip(skip + data.data.length);
      setChatHasMore(data.data.length === chatLimit);
    } catch {
      if (initial) setRecentChats([]);
      setChatHasMore(false);
    } finally {
      setChatLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const { data } = await api.post('/emails/ai/create-chat');
      setChatId(data.data._id);
      setMessages([]);
      localStorage.removeItem('currentChatId');
      lastCreatedChatId.current = data.data._id; // Track the new chat
      fetchRecentChats();
    } catch {}
  };

  const removeEmptyChat = async (chatId) => {
    try {
      await api.delete(`/emails/ai/empty-chat/${chatId}`);
      setRecentChats((prev) => prev.filter((c) => c._id !== chatId));
      if (chatId === chatId) setChatId(null);
    } catch {}
  };

  useEffect(() => {
    if (recentChats.length > 0) {
      recentChats.forEach((chat) => {
        if (!chat.description || chat.description.trim() === '' || chat.description === '(New chat)') {
          removeEmptyChat(chat._id);
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  const handleSelectChat = async (id) => {
    setChatId(id);
    try {
      const { data } = await api.get(`/emails/ai/chat-messages/${id}`);
      setMessages(data.data || []);
    } catch {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streaming]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    lastCreatedChatId.current = null; // User has interacted, clear protection
    const greeting = `Hello,${user?.name ? ' ' + user.name.toLowerCase() : ''}`;
    if (input.trim().toLowerCase() === greeting) {
      setInput('');
      return;
    }
    setShowGreeting(false);
    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setStreaming(true);
    setError(null);
    let aiMsg = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, aiMsg]);
    let gotResponse = false;

    try {
      const eventSource = new EventSourcePolyfill(`http://localhost:5000/api/emails/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message: input }),
        withCredentials: true,
      });

      let newContent = '';
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.line) {
          gotResponse = true;
          setError(null);
          newContent += (newContent ? '\n' : '') + data.line;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: newContent };
            return updated;
          });
        }
        if (data.done) {
          setChatId(data.chatId);
          setStreaming(false);
          eventSource.close();
        }
        if (data.error) {
          setError(data.error);
          setStreaming(false);
          eventSource.close();
        }
      };

      eventSource.onerror = () => {
        if (!gotResponse) {
          setError('Connection error.');
        }
        setStreaming(false);
        eventSource.close();
      };
    } catch (err) {
      setError('Failed to connect.');
      setStreaming(false);
    }
    setInput('');
  };

  useEffect(() => {
    const socket = socketIOClient('http://localhost:5000');
    socket.on('chat:new', (chat) => {
      setRecentChats((prev) => [chat, ...prev.filter((c) => c._id !== chat._id)]);
    });
    socket.on('chat:updated', (update) => {
      setRecentChats((prev) => prev.map((c) => c._id === update._id ? { ...c, description: update.description } : c));
    });
    socket.on('chat:deleted', (data) => {
      setRecentChats((prev) => prev.filter((c) => c._id !== data._id));
      if (chatId === data._id) setChatId(null);
    });
    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, [chatId]);

  // Infinite scroll handler for sidebar
  const handleSidebarScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 40 && chatHasMore && !chatLoading) {
      fetchRecentChats(chatSkip);
    }
  };

  // Chat menu handlers
  const handleMenuToggle = (chatId, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === chatId ? null : chatId);
  };

  const handleRename = async (chatId, e) => {
    e.stopPropagation();
    const chat = recentChats.find(c => c._id === chatId);
    if (chat) {
      setEditingChatId(chatId);
      setEditingName(chat.description || '');
      setOpenMenuId(null);
    }
  };

  const handleSaveRename = async (chatId) => {
    try {
      await api.patch(`/emails/ai/rename-chat/${chatId}`, { description: editingName });
      setRecentChats(prev => prev.map(c => 
        c._id === chatId ? { ...c, description: editingName } : c
      ));
      setEditingChatId(null);
      setEditingName('');
    } catch (error) {
      console.error('Failed to rename chat:', error);
    }
  };

  const handleCancelRename = () => {
    setEditingChatId(null);
    setEditingName('');
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await api.delete(`/emails/ai/delete-chat/${chatId}`);
        setRecentChats(prev => prev.filter(c => c._id !== chatId));
        if (chatId === chatId) setChatId(null);
        setOpenMenuId(null);
      } catch (error) {
        console.error('Failed to delete chat:', error);
      }
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="h-full flex bg-[#18181b] text-white">
      <aside className={`flex flex-col h-full ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-[#232329] py-6 px-2`}>
        <div className={`flex items-center justify-between mb-4 ${sidebarCollapsed ? 'px-0' : 'px-2'} flex-shrink-0`}>
          <span className={`text-2xl font-bold ${sidebarCollapsed ? 'hidden' : ''}`}>MailGenie AI</span>
          <button
            className="p-2 rounded hover:bg-[#27272f]"
            onClick={() => setSidebarCollapsed((c) => !c)}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
          </button>
        </div>
        <div
          className={`max-h-[400px] sm:max-h-[480px] md:max-h-[520px] overflow-y-auto ${sidebarCollapsed ? 'scrollbar-none' : ''}`}
          ref={chatListRef}
          onScroll={handleSidebarScroll}
        >
          <nav className="space-y-2">
            <button onClick={handleNewChat} className={`flex items-center gap-3 text-base hover:bg-[#27272f] px-3 py-1 rounded-lg w-full ${sidebarCollapsed ? 'justify-center px-0' : ''}`}> 
              {!sidebarCollapsed && <span>New chat</span>}
            </button>
            {!sidebarCollapsed && <div className="mt-2 text-xs text-gray-400">Recent</div>}
            {recentChats.length === 0 && !chatLoading ? (
              !sidebarCollapsed && <div className="text-gray-500 text-xs px-3 py-1">No recent chats</div>
            ) : (
              recentChats.map((chat) => (
                <div key={chat._id} className="relative group">
                  {editingChatId === chat._id ? (
                    // Inline editing mode
                    <div className="flex items-center w-full px-3 py-2 rounded-lg bg-[#35363c] border-l-4 border-blue-500">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveRename(chat._id);
                          } else if (e.key === 'Escape') {
                            handleCancelRename();
                          }
                        }}
                        className="flex-1 bg-transparent outline-none text-sm text-white"
                        autoFocus
                      />
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleSaveRename(chat._id)}
                          className="p-1 hover:bg-[#27272f] rounded text-green-400"
                          title="Save"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelRename}
                          className="p-1 hover:bg-[#27272f] rounded text-red-400"
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Normal chat item with menu
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectChat(chat._id)}
                      onKeyPress={(e) => { if (e.key === 'Enter') handleSelectChat(chat._id); }}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-left text-sm truncate transition-colors cursor-pointer
                        ${chatId === chat._id
                          ? 'bg-[#35363c] font-semibold border-l-4 border-blue-500 text-white'
                          : 'hover:bg-[#2a2b30] text-gray-200'}
                        ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                      title={chat.description}
                    >
                      {!sidebarCollapsed && (
                        <span className="truncate flex-1">{chat.description && chat.description.trim().length > 0 ? chat.description : '(New chat)'}</span>
                      )}
                      {!sidebarCollapsed && (
                        <div className="relative flex items-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMenuToggle(chat._id, e); }}
                            className="p-1 hover:bg-[#27272f] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="More options"
                            tabIndex={-1}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {/* Dropdown menu */}
                          {openMenuId === chat._id && (
                            <div className="absolute right-0 top-8 z-50 bg-[#2a2b30] border border-[#35363c] rounded-lg shadow-lg min-w-[120px]"
                              onClick={e => e.stopPropagation()}>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRename(chat._id, e); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[#35363c] text-gray-200"
                              >
                                <Edit className="h-4 w-4" />
                                Rename
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat._id, e); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[#35363c] text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
            {chatLoading && (
              <div className="text-xs text-gray-400 px-3 py-2">Loading...</div>
            )}
            {!chatHasMore && recentChats.length > 0 && (
              <div className="text-xs text-gray-500 px-3 py-2 text-center">No more chats</div>
            )}
          </nav>
        </div>
        <div className="flex-shrink-0 pt-4">
          <button className={`text-sm text-gray-400 hover:text-white ${sidebarCollapsed ? 'w-full flex justify-center' : ''}`}>Settings and help</button>
        </div>
      </aside>

      <main className="flex flex-col h-full w-full">
        <header className="flex justify-between items-center px-8 py-4 border-b border-[#232329] flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold">MailGenie</span>
          </div>
        </header>
        {showGreeting && !messages.length ? (
          <div className="flex flex-1 items-center justify-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
              Hello{user?.name ? `, ${user.name}` : ''}
            </h1>
          </div>
        ) : (
          !chatId ? (
            <div className="flex flex-1 items-center justify-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
                Hello{user?.name ? `, ${user.name}` : ''}
              </h1>
            </div>
          ) : (
            <div className="flex-1 w-full min-h-0 overflow-y-auto">
              <div className="flex flex-col gap-4 px-4 py-6 mb-6">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`
                      flex w-full
                      ${msg.role === 'user' ? 'justify-end' : 'justify-start'}
                    `}
                  >
                    <div
                      className={`
                        max-w-2xl w-full
                        px-6 py-4
                        rounded-2xl
                        shadow
                        text-base
                        leading-relaxed
                        whitespace-pre-line
                        ${msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-[#232329] text-gray-100 rounded-bl-md border border-[#35363c]'}
                      `}
                      style={{
                        marginLeft: msg.role === 'user' ? 'auto' : undefined,
                        marginRight: msg.role === 'user' ? undefined : 'auto',
                      }}
                    >
                      {typeof msg.content === 'string' ? msg.content : '[Unsupported content]'}
                    </div>
                  </div>
                ))}
                {streaming && (
                  <div className="self-start text-gray-400 text-sm">AI is typing...</div>
                )}
                {error && (
                  <div className="self-center text-red-400 text-sm">{error}</div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )
        )}
        <footer className="w-full flex justify-center items-center pb-4 pt-2 flex-shrink-0 bg-transparent">
          <form
            className="bg-[#232329] rounded-2xl flex items-center px-6 py-4 w-full max-w-2xl shadow-lg"
            onSubmit={sendMessage}
          >
            <input
              type="text"
              placeholder="Ask MailGenie"
              className="flex-1 bg-transparent outline-none text-lg placeholder-gray-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!chatId}
            />
            <button
              className="ml-2 text-2xl text-gray-400 hover:text-white"
              type="submit"
              disabled={!chatId || !input.trim()}
            >＋</button>
          </form>
        </footer>
      </main>
    </div>
  );
};

class EventSourcePolyfill {
  constructor(url, options) {
    this.url = url;
    this.options = options;
    this.controller = new AbortController();
    this.onmessage = null;
    this.onerror = null;
    this._connect();
  }
  _connect() {
    fetch(this.url, {
      ...this.options,
      signal: this.controller.signal,
    }).then(async (res) => {
      if (!res.body) throw new Error('No response body');
      const reader = res.body.getReader();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += new TextDecoder().decode(value);
        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const chunk = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          if (chunk.startsWith('data: ')) {
            const data = chunk.slice(6);
            if (this.onmessage) this.onmessage({ data });
          }
        }
      }
    }).catch((err) => {
      if (this.onerror) this.onerror(err);
    });
  }
  close() {
    this.controller.abort();
  }
}

export default ChatWithAI;
