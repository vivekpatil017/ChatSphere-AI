import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../config/axios';
import { UserDataContext } from '../context/User.context';
import { initializeSocket, receiveMessage, sendMessage, removeListener } from '../config/socket';
import Markdown from 'markdown-to-jsx'

const CodeBlock = React.memo(({ children, ...props }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group/code my-3 max-w-full overflow-hidden">
            <button
                onClick={copyToClipboard}
                className="absolute right-3 top-3 p-1.5 px-3 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-400 opacity-0 group-hover/code:opacity-100 transition-all hover:bg-zinc-700 hover:text-white flex items-center gap-2 backdrop-blur-md shadow-xl text-[10px] font-bold uppercase tracking-wider z-20"
            >
                <i className={copied ? "ri-check-line text-green-500 text-sm" : "ri-file-copy-line text-sm"}></i>
                {copied ? 'Copied' : 'Copy'}
            </button>
            <pre className='bg-zinc-950 p-6 rounded-2xl overflow-x-auto border border-zinc-900 shadow-2xl relative scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent text-[13px] max-w-full'>
                <code {...props} className='text-zinc-300 font-mono leading-relaxed block break-normal whitespace-pre'>{children}</code>
            </pre>
        </div>
    );
});

const MessageItem = React.memo(({ msg, currentUser }) => {
    const isSelf = msg.sender?._id === currentUser?._id;
    const isAI = msg.sender?._id?.toLowerCase() === 'ai';

    return (
        <div className={`flex flex-col ${isSelf ? 'items-end ml-auto' : 'items-start'} group animate-message-in max-w-[90%] md:max-w-[80%]`}>
            <div className={`px-4 py-3 rounded-2xl transition-all w-fit max-w-full overflow-hidden ${isSelf ? 'bg-white text-zinc-950 rounded-tr-none shadow-lg' : 'bg-zinc-900 text-zinc-100 rounded-tl-none border border-zinc-800'}`}>
                <small className='opacity-65 text-[10px] block mb-1 font-bold uppercase truncate'>{msg.sender?.email || msg.sender?.name || 'AI'}</small>
                <div className='text-sm leading-relaxed wrap-break-word overflow-wrap-anywhere'>
                    {isAI ? (
                        <div className='overflow-auto'>
                            <Markdown
                                options={{
                                    overrides: {
                                        code: { component: CodeBlock },
                                        p: { component: ({ children }) => <p className='mb-3 last:mb-0 leading-relaxed'>{children}</p> },
                                        strong: { component: ({ children }) => <strong className='text-white font-bold'>{children}</strong> }
                                    }
                                }}
                            >
                                {msg.message}
                            </Markdown>
                        </div>
                    ) : (
                        <p className='font-medium'>{msg.message || msg.text}</p>
                    )}
                </div>
                <div className='flex items-center justify-end gap-2 mt-2'>
                    <span className='text-[9px] text-zinc-500 opacity-60'>{msg.time || 'now'}</span>
                </div>
            </div>
        </div>
    );
});

const placeholderTips = [
    "Type a message...",
    "Mention @ai to chat with the assistant! 🤖",
    "Ask @ai to generate code or explain concepts... 💻",
    "Need help? Just type @ai followed by your question!"
];

const Project = () => {
    const location = useLocation();
    const { user } = useContext(UserDataContext);
    const messageEndRef = useRef(null);
    
    // UI State
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState([]);
    const [message, setMessage] = useState("");
    const [isSidebarVisible, setIsSidebarVisible] = useState(false); // Mobile sidebar toggle
    const [isTyping, setIsTyping] = useState(false); // AI thinking state
    const [isConnected, setIsConnected] = useState(false); // Socket status
    const [showScrollButton, setShowScrollButton] = useState(false); // Jump to latest button
    const [streamingContent, setStreamingContent] = useState(""); // Live AI chunks
    const [isStreaming, setIsStreaming] = useState(false); // Whether AI is currently typing live
    const [sidePanelTab, setSidePanelTab] = useState("details"); // "details" | "files"
    const [fileTree, setFileTree] = useState({}); // Virtual file system
    const [searchQuery, setSearchQuery] = useState(""); // Message search

    // API Data State
    const [project, setProject] = useState(location.state?.project || null);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]); // Dynamic messages list

    // AI Placeholder Logic
    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % placeholderTips.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Scroll to bottom whenever messages or streaming content update
    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingContent]);

    // 1. Fetch data
    useEffect(() => {
        if (!location.state?.project?._id) return;

        const projectId = location.state.project._id;

        axios.get('/user/all')
            .then(res => setUsers(res.data.users))
            .catch(err => console.error("Error fetching users:", err));

        axios.get(`/projects/get-project/${projectId}`)
            .then(res => setProject(res.data))
            .catch(err => console.error("Error fetching project details:", err));

    }, [location.state?.project?._id]);

    // 2. Initializing Socket
    useEffect(() => {
        if (!location.state?.project?._id) return;

        const projectId = location.state.project._id;
        console.log("Initializing socket for project:", projectId);

        const socketInstance = initializeSocket(projectId);

        socketInstance.on('connect', () => setIsConnected(true));
        socketInstance.on('disconnect', () => setIsConnected(false));

        const onMessage = (data) => {
            console.log("New message received:", data);
            const msgWithId = { ...data, id: data.id || `msg-${Date.now()}-${Math.random()}` };
            setMessages(prev => [...prev, msgWithId]);
            if (data.sender?._id?.toLowerCase() === 'ai') {
                setIsTyping(false);
            }
        };

        const onMessageChunk = (data) => {
            setIsTyping(false);
            setIsStreaming(true);
            setStreamingContent(prev => prev + data.chunk);
        };

        const onMessageEnd = (data) => {
            setIsStreaming(false);
            setStreamingContent("");
            
            // Parse for file tree if present
            if (data.fullResponse.includes("### 📁 Folder Structure")) {
                const lines = data.fullResponse.split("\n");
                const structureStart = lines.findIndex(l => l.includes("### 📁 Folder Structure"));
                if (structureStart !== -1) {
                    const structure = lines.slice(structureStart + 1, structureStart + 15).join("\n");
                    // Simple regex/parsing logic could go here to update fileTree
                    // For now, we'll just set a mock structure based on the prompt's common output
                    setFileTree({
                        "root": { type: "folder", children: ["src", "public", "package.json"] },
                        "src": { type: "folder", children: ["app.js", "styles.css"] },
                        "package.json": { type: "file" },
                        "app.js": { type: "file" }
                    });
                }
            }

            setMessages(prev => [...prev, {
                id: `ai-${Date.now()}`,
                message: data.fullResponse,
                sender: data.sender,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        };

        // 3. Listen for incoming messages
        receiveMessage("Project-message", onMessage);
        receiveMessage("Project-message-chunk", onMessageChunk);
        receiveMessage("Project-message-end", onMessageEnd);

        // Cleanup: Disconnect socket and remove listeners when leaving project
        return () => {
            if (socketInstance) {
                removeListener("Project-message", onMessage);
                removeListener("Project-message-chunk", onMessageChunk);
                removeListener("Project-message-end", onMessageEnd);
            }
        };

    }, [location.state?.project?._id]);

    const filteredMessages = React.useMemo(() => {
        return messages.filter(m => m.message?.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [messages, searchQuery]);

    const handleUserSelect = (id) => {
        setSelectedUserId(prev => {
            if (prev.includes(id)) {
                return prev.filter(uid => uid !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const addCollaborators = () => {
        if (!project?._id || selectedUserId.length === 0) return;

        axios.put('/projects/add-user', {
            projectId: project._id,
            users: selectedUserId
        })
            .then(res => {
                if (res.data.project) {
                    setProject(res.data.project);
                }
                setIsModalOpen(false);
                setSelectedUserId([]);
            })
            .catch(err => console.error("Error adding collaborators:", err));
    };

    const send = () => {
        if (!message.trim() || !user) return;

        const messageData = {
            id: `user-${Date.now()}`,
            message,
            sender: user,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        console.log("Sending message:", messageData);

        // Emit to server
        sendMessage('Project-message', messageData);

        if (message.includes("@ai")) {
            setIsTyping(true);
        }

        // Add to local feed immediately
        setMessages(prev => [...prev, messageData]);

        // Clear input
        setMessage('');
    };

    if (!project) {
        return (
            <div className='h-screen w-screen flex items-center justify-center bg-zinc-950 text-white p-6 font-sans'>
                <div className='max-w-md w-full bg-zinc-900 p-8 rounded-2xl border border-zinc-800 text-center shadow-2xl'>
                    <i className="ri-error-warning-line text-5xl text-zinc-600 mb-4 block"></i>
                    <h2 className='text-xl font-bold mb-2'>Project Session Expired</h2>
                    <p className='text-zinc-500 text-sm mb-6'>We couldn't retrieve the project details. Please return to the homepage and select your project again.</p>
                    <button onClick={() => window.location.href = '/'} className='w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all'>Return Home</button>
                </div>
            </div>
        );
    }

    return (
        <main className='h-screen w-screen flex bg-zinc-950 text-zinc-300 font-sans overflow-hidden relative'>
            {/* Sidebar Overflow Overlay (Mobile) */}
            {isSidebarVisible && (
                <div 
                    onClick={() => setIsSidebarVisible(false)}
                    className='lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-20 transition-all duration-300'
                />
            )}

            {/* Sidebar */}
            <section className={`sidebar fixed lg:relative h-full min-w-80 w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-500 ease-in-out z-30 ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <header className='flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900'>
                    <button onClick={() => setIsModalOpen(true)} className='flex items-center gap-2 hover:bg-zinc-800 px-3 py-2 rounded-md transition-all border border-zinc-800 hover:border-zinc-700'>
                        <i className="ri-user-add-line text-lg"></i>
                        <span className='font-medium text-xs'>Add Collaborator</span>
                    </button>
                    <button onClick={() => setIsSidePanelOpen(true)} className='p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-white'>
                        <i className="ri-group-line text-xl"></i>
                    </button>
                </header>

                <div className="users-list flex-grow overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {/* AI Assistant (Always top) */}
                    <div className="user-item flex items-center gap-3 p-3 rounded-xl cursor-default hover:bg-zinc-800/20 transition-all group">
                        <div className='relative shrink-0'>
                            <div className='w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30 group-hover:border-indigo-400 transition-colors shadow-[0_0_15px_-3px_rgba(79,70,229,0.4)]'>
                                <i className="ri-robot-2-line text-xl"></i>
                            </div>
                            <div className='absolute bottom-0 right-0 w-3 h-3 bg-indigo-500 rounded-full border-2 border-zinc-900 animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.8)]'></div>
                        </div>
                        <div className='flex flex-col min-w-0'>
                            <h2 className='text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors truncate'>AI Assistant</h2>
                            <p className='text-[10px] text-zinc-500 uppercase tracking-tighter'>AI Collaborator</p>
                        </div>
                    </div>

                    {project?.users?.map((collaborator) => (
                        <div key={collaborator._id} className="user-item flex items-center gap-3 p-3 rounded-xl cursor-default hover:bg-zinc-800/20 transition-all group">
                            <div className='relative shrink-0'>
                                <div className='w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold border border-zinc-700 group-hover:border-zinc-500 transition-colors'>
                                    {collaborator.email?.[0].toUpperCase() || '?'}
                                </div>
                                <div className='absolute bottom-0 right-0 w-3 h-3 bg-zinc-500 rounded-full border-2 border-zinc-900'></div>
                            </div>
                            <div className='flex flex-col min-w-0'>
                                <h2 className='text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors truncate'>{collaborator.email}</h2>
                                <p className='text-[10px] text-zinc-500 uppercase tracking-tighter'>Member</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`absolute top-0 left-0 h-full w-full bg-zinc-900 z-20 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl border-r border-zinc-800`}>
                    <header className='flex flex-col border-b border-zinc-800 bg-zinc-900'>
                        <div className='flex items-center justify-between p-4'>
                            <h2 className='font-bold text-lg text-white'>Project Center</h2>
                            <button onClick={() => setIsSidePanelOpen(false)} className='p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-white'>
                                <i className="ri-close-line text-2xl"></i>
                            </button>
                        </div>
                        <div className='flex px-4 gap-4'>
                            <button 
                                onClick={() => setSidePanelTab("details")}
                                className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${sidePanelTab === 'details' ? 'text-white border-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
                            >
                                Details
                            </button>
                            <button 
                                onClick={() => setSidePanelTab("files")}
                                className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${sidePanelTab === 'files' ? 'text-white border-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
                            >
                                Files
                            </button>
                        </div>
                    </header>
                    <div className='p-4 space-y-6 overflow-y-auto h-[calc(100%-110px)] custom-scrollbar'>
                        {sidePanelTab === 'details' ? (
                            <>
                                <div className='bg-zinc-950 p-4 rounded-xl border border-zinc-800'>
                                    <h3 className='text-[10px] font-bold text-zinc-500 uppercase mb-1'>Project Name</h3>
                                    <p className='text-white font-bold'>{project?.name}</p>
                                </div>
                                <div>
                                    <h3 className='text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 border-l-2 border-white pl-2'>Collaborators</h3>
                                    <div className='space-y-3'>
                                        {project?.users?.map(collaborator => (
                                            <div key={collaborator._id} className='flex items-center gap-3 p-2 hover:bg-zinc-800/30 rounded-lg'>
                                                <div className='w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 text-xs text-zinc-300'>{collaborator.email?.[0].toUpperCase() || '?'}</div>
                                                <span className='text-sm text-zinc-300'>{collaborator.email}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className='space-y-4 font-mono'>
                                <h3 className='text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 border-l-2 border-indigo-500 pl-2'>Project Workspace</h3>
                                {Object.keys(fileTree).length === 0 ? (
                                    <div className='text-center py-10'>
                                        <i className="ri-folder-info-line text-4xl text-zinc-800 mb-2 block"></i>
                                        <p className='text-zinc-600 text-[10px] uppercase font-bold px-4'>Ask AI to generate a project structure to see it here.</p>
                                    </div>
                                ) : (
                                    <div className='space-y-1'>
                                        {Object.entries(fileTree).map(([name, data]) => (
                                            <div key={name} className='flex items-center gap-2 group/file cursor-pointer p-1.5 hover:bg-zinc-800/50 rounded-md transition-colors'>
                                                <i className={`${data.type === 'folder' ? 'ri-folder-3-fill text-indigo-400' : 'ri-file-code-line text-zinc-500'} text-lg`}></i>
                                                <span className='text-xs text-zinc-300 group-hover/file:text-white'>{name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Chat Area */}
            <section className='chat-area flex-grow flex flex-col bg-zinc-950 relative h-full overflow-hidden'>
                <header className='h-16 flex items-center px-4 md:px-6 border-b border-zinc-900 justify-between bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10'>
                    <div className='flex items-center gap-3 md:gap-4'>
                        <button onClick={() => setIsSidebarVisible(true)} className='lg:hidden p-2 hover:bg-zinc-800 rounded-lg text-zinc-400'>
                            <i className="ri-menu-line text-xl"></i>
                        </button>
                        <div className='w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex shrink-0 items-center justify-center shadow-inner relative'>
                            <i className="ri-shield-user-line text-zinc-400 text-xl"></i>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-950 ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                        </div>
                        <div className='flex flex-col min-w-0'>
                            <h3 className='text-sm font-bold text-white tracking-tight truncate max-w-[150px] sm:max-w-[200px] md:max-w-none'>{project?.name}</h3>
                            <div className='flex items-center gap-2'>
                                <span className='w-1.5 h-1.5 bg-zinc-500 rounded-full'></span>
                                <p className='text-[10px] text-zinc-500 uppercase tracking-widest font-semibold truncate'>{project?.users?.length || 0} Members</p>
                            </div>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        <div className='relative hidden sm:block'>
                            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs"></i>
                            <input 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                type="text" 
                                placeholder="Search project..." 
                                className='bg-zinc-900 border border-zinc-800 rounded-full py-1.5 pl-8 pr-4 text-[10px] w-40 focus:w-60 focus:border-zinc-600 transition-all focus:outline-none text-zinc-300'
                            />
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isConnected ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'} hidden sm:block`}>
                            {isConnected ? 'Connected' : 'Reconnecting...'}
                        </span>
                    </div>
                </header>

                <div 
                    onScroll={(e) => {
                        const target = e.currentTarget;
                        setShowScrollButton(target.scrollHeight - target.scrollTop - target.clientHeight > 400);
                    }}
                    className="message-feed flex-grow overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar scroll-smooth"
                >
                    {filteredMessages.map((msg) => (
                        <MessageItem key={msg.id} msg={msg} currentUser={user} />
                    ))}

                    {isStreaming && (
                        <div className='flex flex-col items-start group animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-[90%] md:max-w-[80%]'>
                            <div className='px-4 py-3 rounded-2xl transition-all w-fit max-w-full overflow-hidden bg-zinc-900 text-zinc-100 rounded-tl-none border border-zinc-800 shadow-xl'>
                                <small className='opacity-65 text-[10px] block mb-1 font-bold uppercase'>AI Assistant (Typing...)</small>
                                <div className='text-sm leading-relaxed break-words overflow-wrap-anywhere'>
                                    <div className='overflow-auto'>
                                        <Markdown
                                            options={{
                                                overrides: {
                                                    code: { component: CodeBlock },
                                                    p: { component: ({ children }) => <p className='mb-3 last:mb-0 leading-relaxed'>{children}</p> },
                                                    strong: { component: ({ children }) => <strong className='text-white font-bold'>{children}</strong> }
                                                }
                                            }}
                                        >
                                            {streamingContent}
                                        </Markdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isTyping && !isStreaming && (
                        <div className='flex flex-col items-start group animate-pulse duration-700'>
                            <div className='bg-zinc-900 text-zinc-500 px-4 py-3 rounded-2xl rounded-tl-none border border-zinc-800 flex items-center gap-2 shadow-inner'>
                                <div className='flex gap-1'>
                                    <span className='w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]'></span>
                                    <span className='w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]'></span>
                                    <span className='w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce'></span>
                                </div>
                                <span className='text-xs font-bold uppercase tracking-widest'>AI is thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messageEndRef} />
                </div>

                {showScrollButton && (
                    <button 
                        onClick={scrollToBottom}
                        className='absolute bottom-28 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-white/20 transition-all shadow-2xl z-20 animate-in fade-in slide-in-from-bottom-4 duration-500'
                    >
                        <i className="ri-arrow-down-line"></i> New Messages
                    </button>
                )}

                <div className="input-container p-6 bg-zinc-950 border-t border-zinc-900">
                    <div className='relative flex items-center max-w-5xl mx-auto w-full group/input'>
                        <button 
                            onClick={() => setMessage(prev => prev + ' @ai ')}
                            className='absolute left-4 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 group/btn'
                        >
                            <div className='relative'>
                                <i className="ri-add-line text-2xl"></i>
                                {messages.length < 5 && (
                                    <span className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"></span>
                                )}
                            </div>
                            <span className='absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-[10px] uppercase font-bold text-zinc-400 rounded-md opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none'>Mention AI</span>
                        </button>
                        <input 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && send()}
                            type="text" 
                            placeholder={placeholderTips[placeholderIndex]} 
                            className='w-full bg-zinc-900 border border-zinc-800 p-4 pl-12 pr-16 rounded-2xl text-sm focus:outline-none focus:border-zinc-600 transition-all text-zinc-100 placeholder:transition-opacity placeholder:duration-500'
                        />
                        <button onClick={send} className='absolute right-4 bg-white text-zinc-950 p-2 rounded-xl hover:bg-zinc-200 transition-all active:scale-95 shadow-lg group'>
                            <i className="ri-send-plane-2-fill text-xl group-hover:translate-x-0.5 transition-transform"></i>
                        </button>
                    </div>
                </div>
            </section>

            {/* Modal */}
            {isModalOpen && (
                <div className='fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all'>
                    <div className='bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl animate-in fade-in zoom-in duration-300 overflow-hidden shadow-2xl'>
                        <header className='p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50'>
                            <h2 className='font-bold text-white tracking-tight flex items-center gap-2'><i className="ri-user-search-line text-zinc-400"></i>Add Collaborator</h2>
                            <button onClick={() => setIsModalOpen(false)} className='p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-white'><i className="ri-close-line text-xl"></i></button>
                        </header>
                        <div className='p-2 max-h-96 overflow-y-auto custom-scrollbar bg-zinc-950/20'>
                            {users.map((u) => (
                                <div key={u._id} onClick={() => handleUserSelect(u._id)} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border mb-1 group ${selectedUserId.includes(u._id) ? 'bg-zinc-100 border-zinc-100' : 'bg-transparent border-transparent hover:bg-zinc-800/40 hover:border-zinc-800'}`}>
                                    <div className='flex items-center gap-3'>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border transition-colors ${selectedUserId.includes(u._id) ? 'bg-zinc-950 text-white border-zinc-800' : 'bg-zinc-900 text-zinc-300 border-zinc-800 group-hover:border-zinc-700'}`}>{u.email?.[0].toUpperCase() || '?'}</div>
                                        <div className='flex flex-col'><span className={`text-sm font-semibold transition-colors ${selectedUserId.includes(u._id) ? 'text-zinc-950' : 'text-zinc-200'}`}>{u.email}</span></div>
                                    </div>
                                    {selectedUserId.includes(u._id) && <div className='bg-zinc-950 text-white w-6 h-6 rounded-full flex items-center justify-center'><i className="ri-check-line text-sm"></i></div>}
                                </div>
                            ))}
                        </div>
                        <footer className='p-4 border-t border-zinc-800 flex justify-end gap-3'>
                            <button onClick={() => setIsModalOpen(false)} className='px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors'>Cancel</button>
                            <button onClick={addCollaborators} disabled={selectedUserId.length === 0} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg ${selectedUserId.length > 0 ? 'bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>Add Member</button>
                        </footer>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; } 
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; } 
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }

                @keyframes messageIn {
                    from { opacity: 0; transform: translateY(10px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-message-in {
                    animation: messageIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both;
                }
            ` }} />
        </main>
    );
};

export default Project;