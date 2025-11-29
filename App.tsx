
import React, { useState, useEffect, useCallback } from 'react';
import { PasswordEntry } from './types';
import { KeyIcon, CopyIcon, CheckIcon, TrashIcon, EyeOpenIcon, EyeSlashedIcon } from './constants.tsx';

const App: React.FC = () => {
    // === STATE MANAGEMENT ===
    const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
    const [newWebsite, setNewWebsite] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true); // For initial data load
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});

    // Helper to set a more informative error
    const setApiError = async (message: string, response?: Response) => {
        let detailedError = message;
        if (response) {
            try {
                const errorJson = await response.json();
                if (errorJson.message) {
                    detailedError = `${message} (Details: ${errorJson.message})`;
                }
            } catch (e) {
                // Ignore if response body is not JSON or empty
            }
        }
        setError(detailedError);
    };

    // === API DATA FETCHING ===
    useEffect(() => {
        const fetchPasswords = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/passwords');
                if (!response.ok) {
                    await setApiError("Could not load saved passwords from the cloud.", response);
                    return;
                }
                const data: PasswordEntry[] = await response.json();
                setPasswords(data);
            } catch (e) {
                console.error("Failed to fetch passwords from API", e);
                setError("A network error occurred while trying to load passwords.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPasswords();
    }, []);

    // === CORE HANDLERS ===
    const handleGeneratePassword = useCallback(() => {
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
        const allChars = upper + lower + numbers + symbols;
        let generatedPassword = '';
        if (window.crypto && window.crypto.getRandomValues) {
            const randomValues = new Uint32Array(16);
            window.crypto.getRandomValues(randomValues);
            for (let i = 0; i < 16; i++) {
                generatedPassword += allChars.charAt(randomValues[i] % allChars.length);
            }
        } else {
            for (let i = 0; i < 16; i++) {
                generatedPassword += allChars.charAt(Math.floor(Math.random() * allChars.length));
            }
        }
        setNewPassword(generatedPassword);
    }, []);

    const handleSavePassword = async () => {
        if (!newWebsite.trim() || !newPassword.trim()) {
            setError("Website name and password cannot be empty.");
            return;
        }
        setError(null);
        try {
            const response = await fetch('/api/passwords', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ website: newWebsite.trim(), password: newPassword.trim() }),
            });
            if (!response.ok) {
                await setApiError("Could not save the new credential.", response);
                return;
            }
            const newEntry: PasswordEntry = await response.json();
            setPasswords(prev => [newEntry, ...prev]);
            setNewWebsite('');
            setNewPassword('');
        } catch (e) {
            console.error("Failed to save password via API", e);
            setError("A network error occurred while trying to save the credential.");
        }
    };

    const handleCopy = async (text: string, id: number) => {
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                setCopiedId(id);
                setTimeout(() => setCopiedId(null), 2000);
                return;
            } catch (err) {
                console.warn("navigator.clipboard.writeText failed, falling back.", err);
            }
        }
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.top = '-9999px';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error("Fallback copy method failed:", err);
            setError("Could not copy to clipboard. Please copy the password manually.");
        }
    };

    const handleDelete = async (id: number | undefined) => {
        if (id === undefined) return;
        setError(null);
        try {
            const response = await fetch(`/api/passwords/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                await setApiError("Could not delete the credential.", response);
                return;
            }
            setPasswords(passwords.filter(p => p.id !== id));
        } catch (e) {
            console.error("Failed to delete password via API", e);
            setError("A network error occurred while trying to delete the credential.");
        }
    };

    const togglePasswordVisibility = (id: number) => {
        setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // === RENDER LOGIC ===
    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
            <main className="max-w-3xl mx-auto">
                <header className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                        PassFortress
                    </h1>
                    <p className="mt-2 text-slate-400">Your secure, cloud-synced password vault.</p>
                </header>

                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <section aria-labelledby="create-password-heading" className="mb-12">
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl shadow-indigo-900/20">
                        <div className="p-6">
                            <h2 id="create-password-heading" className="text-xl font-semibold text-slate-100 mb-4">Add New Credential</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="website-name" className="block text-sm font-medium text-slate-400 mb-1">Website / Service</label>
                                    <input id="website-name" type="text" value={newWebsite} onChange={(e) => setNewWebsite(e.target.value)} placeholder="e.g., Google, GitHub, MyBank" className="form-input w-full bg-slate-900/70 border border-slate-600 rounded-md py-2 px-3 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                                </div>
                                <div className="relative">
                                    <label htmlFor="new-password" className="block text-sm font-medium text-slate-400 mb-1">Generated Password</label>
                                    <input id="new-password" type="text" readOnly value={newPassword} placeholder="Click 'Generate' to create a password" className="form-input-ro w-full bg-slate-900/70 border border-slate-600 rounded-md py-2 px-3 pr-20 text-slate-200 placeholder-slate-500 font-mono" />
                                    <div className="absolute right-2 top-[29px] flex space-x-1">
                                        <button onClick={() => handleCopy(newPassword, 0)} disabled={!newPassword} title="Copy password" className="flex items-center justify-center h-7 w-7 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-full text-slate-300 transition-colors">
                                            {copiedId === 0 ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                                        </button>
                                        <button onClick={handleGeneratePassword} title="Generate new password" className="flex items-center justify-center h-7 w-7 bg-slate-700 hover:bg-slate-600 rounded-full text-slate-300 transition-colors">
                                            <KeyIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800/70 px-6 py-3 rounded-b-xl">
                             <button onClick={handleSavePassword} disabled={!newWebsite || !newPassword} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center">
                                Save Credential
                            </button>
                        </div>
                    </div>
                </section>

                <section aria-labelledby="saved-passwords-heading">
                    <h2 id="saved-passwords-heading" className="text-xl font-semibold text-slate-100 mb-4">Saved Credentials</h2>
                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="text-center py-10 text-slate-400">Loading credentials...</div>
                        ) : passwords.length > 0 ? (
                            passwords.map(entry => (
                                <div key={entry.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all hover:bg-slate-700/50 hover:border-slate-600">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-lg font-medium text-slate-200 truncate">{entry.website}</p>
                                        <p className="text-sm text-slate-400 font-mono break-all">
                                            {visiblePasswords[entry.id!] ? entry.password : '•'.repeat(16)}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                        <button onClick={() => togglePasswordVisibility(entry.id!)} title={visiblePasswords[entry.id!] ? "Hide password" : "Show password"} className="p-2 rounded-full hover:bg-slate-600/50 text-slate-400 hover:text-slate-200 transition-colors">
                                            {visiblePasswords[entry.id!] ? <EyeSlashedIcon /> : <EyeOpenIcon />}
                                        </button>
                                        <button onClick={() => handleCopy(entry.password, entry.id!)} title="Copy password" className="p-2 rounded-full hover:bg-slate-600/50 text-slate-400 hover:text-slate-200 transition-colors">
                                            {copiedId === entry.id ? <CheckIcon className="text-green-400" /> : <CopyIcon />}
                                        </button>
                                        <button onClick={() => handleDelete(entry.id)} title="Delete password" className="p-2 rounded-full hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-colors">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 px-6 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-lg">
                                <p className="text-slate-400">No passwords saved yet.</p>
                                <p className="text-slate-500 text-sm mt-1">Use the form above to add your first one.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default App;
