import React, { useContext, useState, useEffect } from 'react'
import { UserDataContext } from '../context/User.context'
import axios from '../config/axios'
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserDataContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [allProjects, setAllProjects] = useState([]);

    function createProject(e) {
        e.preventDefault();
        console.log({ projectName });

        axios.post('http://localhost:3000/projects/create', { name: projectName })
            .then((res) => {
                console.log(res);
                setIsModalOpen(false);
                setProjectName('');
            })
            .catch((err) => {
                console.log(err);
            });
    }

    useEffect(() => {
        axios.get('http://localhost:3000/projects/all', {
            withCredentials: true,
        })
            .then((res) => {
                console.log(res.data);
                setAllProjects(res.data.allUserProjects);

            })
            .catch((err) => {
                console.log(err);
            });
    }, [])

    return (
        <main className='min-h-screen bg-[var(--bg-deep)] p-6 md:p-10 overflow-x-hidden'>
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 animate-in slide-in-from-top-10 duration-700">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Your Projects</h1>
                        <p className="text-[var(--text-muted)] text-sm">Manage and collaborate on your AI-driven projects</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/90 text-white font-semibold rounded-xl shadow-lg shadow-[var(--accent-blue)]/20 transition-all active:scale-95 group"
                    >
                        <i className="ri-add-line text-xl group-hover:rotate-90 transition-transform duration-300"></i>
                        <span>New Project</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {
                        allProjects.map((project, index) => (
                            <div 
                                key={project._id} 
                                onClick={() => {
                                    navigate('/project', {
                                        state: {
                                            project
                                        }
                                    })
                                }} 
                                style={{
                                    animationDelay: `${index * 100}ms`
                                }}
                                className="group relative bg-[var(--bg-card)]/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl cursor-pointer hover:border-[var(--accent-cyan)]/40 hover:shadow-[0_20px_50px_rgba(6,182,212,0.15)] transition-all duration-500 flex flex-col justify-between min-h-[160px] animate-fade-in-up hover:-translate-y-2 hover:perspective-1000 project-card-3d"
                            >
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex gap-2 z-10">
                                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
                                        <i className="ri-edit-line"></i>
                                    </button>
                                    <button className="p-2 bg-white/5 hover:bg-red-500/10 rounded-lg text-white/50 hover:text-red-500 transition-colors">
                                        <i className="ri-delete-bin-line"></i>
                                    </button>
                                </div>

                                <div className="relative z-0">
                                    <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-[var(--accent-cyan)] transition-colors line-clamp-1 group-hover:translate-z-20">{project.name}</h2>
                                    <div className='flex items-center gap-2 text-[var(--text-muted)] text-sm'>
                                        <i className="ri-user-line text-xs"></i>
                                        <span>{project.users.length} collaborator{project.users.length !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                                
                                <div className="mt-4 flex items-center justify-between relative z-0">
                                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-[var(--text-muted)] border border-white/5 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 group-hover:border-cyan-500/20 transition-all">Active</span>
                                    <i className="ri-arrow-right-up-line text-[var(--text-muted)] group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"></i>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 z-50 animate-in fade-in duration-300">
                    <div className="bg-[var(--bg-card)] border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white tracking-tight">Create New Project</h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-xl text-[var(--text-muted)] hover:text-white transition-colors"
                            >
                                <i className="ri-close-line text-xl"></i>
                            </button>
                        </div>

                        <form onSubmit={createProject}>
                            <div className="mb-6">
                                <label className="block text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider mb-2 ml-1" htmlFor="projectName">
                                    Project Name
                                </label>
                                <input
                                    onChange={(e) => setProjectName(e.target.value)}
                                    value={projectName}
                                    type="text"
                                    id="projectName"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent-blue)] focus:ring-2 focus:ring-[var(--accent-blue)]/20 transition-all"
                                    placeholder="e.g. My Awesome AI App"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/90 text-white font-semibold rounded-xl shadow-lg shadow-[var(--accent-blue)]/20 transition-all active:scale-95"
                                >
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
                .project-card-3d {
                    transform-style: preserve-3d;
                    transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease, border-color 0.5s ease;
                }
                .project-card-3d:hover {
                    transform: perspective(1000px) rotateX(4deg) rotateY(-4deg) translateY(-8px);
                }
                .translate-z-20 {
                    transform: translateZ(20px);
                }
            ` }} />
        </main>
    )
}

export default Home;