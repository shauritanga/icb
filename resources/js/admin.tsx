import '../css/app.css';

import React, {
    createContext,
    FormEvent,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { createRoot } from 'react-dom/client';
import {
    Bell,
    BookOpen,
    BriefcaseBusiness,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ExternalLink,
    FileText,
    FolderOpen,
    LayoutDashboard,
    Link2,
    LogOut,
    Newspaper,
    Plus,
    Save,
    Search,
    Settings,
    Trash2,
    Upload,
    UserRound,
    Users,
    UsersRound,
    Moon,
    PanelLeft,
    Sun,
    Wrench,
    XCircle,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

type AuthUser = { name: string; email: string };
type FieldType = 'text' | 'textarea' | 'richtext' | 'number' | 'boolean' | 'datetime' | 'image' | 'file' | 'select' | 'images';
type Field = {
    name: string;
    label: string;
    type: FieldType;
    required?: boolean;
    options?: string[];
};
type ResourceConfig = {
    resource: string;
    title: string;
    description: string;
    fields: Field[];
};
type ResourceItem = Record<string, any> & {
    id: number;
    display_title?: string;
    is_published?: boolean;
};
type PaginationMeta = {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
};
type DashboardData = {
    stats: { label: string; value: number; meta: string; resource: string }[];
    health: { label: string; value: number; target: number; percent: number; status: string; resource: string }[];
    projects: { title: string; client: string; status: string; published: boolean }[];
    news: { title: string; date: string; published: boolean }[];
};
type ToastItem = { id: number; type: 'success' | 'error'; message: string };
type AdminUserRecord = { id: number; name: string; email: string; is_admin: boolean };

// ─────────────────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────────────────

const csrf = () =>
    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

async function api(path: string, options: RequestInit = {}): Promise<any> {
    const res = await fetch(path, {
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrf(),
            ...(options.headers ?? {}),
        },
        ...options,
    });

    if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
            const json = await res.json();
            if (json.message) message = json.message;
            if (json.errors) {
                message = Object.values(json.errors as Record<string, string[]>)
                    .flat()
                    .join(' · ');
            }
        } catch {}
        throw new Error(message);
    }

    return res.json();
}

async function uploadFile(file: File): Promise<string> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf() },
        body: form,
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url as string;
}

// ─────────────────────────────────────────────────────────
// Data helpers
// ─────────────────────────────────────────────────────────

function getNested(data: Record<string, any>, path: string): any {
    return path.split('.').reduce((carry, key) => carry?.[key], data) ?? '';
}

function setNested(data: Record<string, any>, path: string, value: any): Record<string, any> {
    const next = structuredClone(data);
    const keys = path.split('.');
    let cursor = next as any;
    keys.slice(0, -1).forEach((key) => {
        cursor[key] ??= {};
        cursor = cursor[key];
    });
    cursor[keys[keys.length - 1]] = value;
    return next;
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// ─────────────────────────────────────────────────────────
// Toast system
// ─────────────────────────────────────────────────────────

const ToastCtx = createContext<{ show: (type: ToastItem['type'], msg: string) => void }>({
    show: () => {},
});

function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const counter = useRef(0);

    const show = useCallback((type: ToastItem['type'], message: string) => {
        const id = ++counter.current;
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
    }, []);

    return (
        <ToastCtx.Provider value={{ show }}>
            {children}
            <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50 pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white pointer-events-auto ${
                            t.type === 'success' ? 'bg-green-700' : 'bg-red-700'
                        }`}
                    >
                        {t.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastCtx.Provider>
    );
}

function useToast() {
    return useContext(ToastCtx);
}

// ─────────────────────────────────────────────────────────
// Rich Text Editor (contentEditable + execCommand)
// ─────────────────────────────────────────────────────────

function RichTextEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const editorRef = useRef<HTMLDivElement>(null);
    const focused = useRef(false);

    useEffect(() => {
        if (editorRef.current && !focused.current) {
            editorRef.current.innerHTML = value ?? '';
        }
    }, [value]);

    function exec(command: string, arg?: string) {
        editorRef.current?.focus();
        document.execCommand(command, false, arg ?? '');
        onChange(editorRef.current?.innerHTML ?? '');
    }

    function handleLink() {
        const url = window.prompt('Enter link URL:');
        if (url) exec('createLink', url);
    }

    const btnCls =
        'px-2 py-1 rounded text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer border-0 bg-transparent';
    const sep = <span className="w-px bg-slate-300 mx-0.5 self-stretch" />;

    return (
        <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="flex gap-0.5 flex-wrap items-center p-1.5 bg-slate-50 border-b border-slate-200">
                <button type="button" className={btnCls} onMouseDown={(e) => { e.preventDefault(); exec('bold'); }}>
                    <strong>B</strong>
                </button>
                <button type="button" className={btnCls} onMouseDown={(e) => { e.preventDefault(); exec('italic'); }}>
                    <em>I</em>
                </button>
                <button type="button" className={`${btnCls} underline`} onMouseDown={(e) => { e.preventDefault(); exec('underline'); }}>
                    U
                </button>
                {sep}
                <button type="button" className={btnCls} onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', 'h2'); }}>H2</button>
                <button type="button" className={btnCls} onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', 'h3'); }}>H3</button>
                <button type="button" className={btnCls} onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', 'p'); }}>P</button>
                {sep}
                <button type="button" className={btnCls} onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList'); }}>• List</button>
                <button type="button" className={btnCls} onMouseDown={(e) => { e.preventDefault(); exec('insertOrderedList'); }}>1. List</button>
                {sep}
                <button type="button" className={btnCls} onMouseDown={(e) => { e.preventDefault(); handleLink(); }}>
                    <Link2 size={13} className="inline" />
                </button>
                <button type="button" className={`${btnCls} text-slate-400`} onMouseDown={(e) => { e.preventDefault(); exec('removeFormat'); }}>
                    Clear
                </button>
            </div>
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="rte-content min-h-[160px] p-3 outline-none text-sm text-slate-800"
                onFocus={() => { focused.current = true; }}
                onBlur={() => {
                    focused.current = false;
                    onChange(editorRef.current?.innerHTML ?? '');
                }}
                onInput={() => onChange(editorRef.current?.innerHTML ?? '')}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────
// File Upload
// ─────────────────────────────────────────────────────────

function FileUpload({
    value,
    onChange,
    accept = 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml',
    isImage = true,
}: {
    value: string;
    onChange: (url: string) => void;
    accept?: string;
    isImage?: boolean;
}) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const previewSrc =
        isImage && value && (value.startsWith('/') || value.startsWith('http')) ? value : null;

    async function handleFile(file: File) {
        setUploading(true);
        try {
            const url = await uploadFile(file);
            onChange(url);
        } catch {
            alert('Upload failed. Please check the file type and try again.');
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="flex flex-col gap-2">
            {previewSrc && (
                <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <img
                        src={previewSrc}
                        alt="Preview"
                        className="w-full max-h-48 object-contain"
                    />
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold leading-none hover:bg-red-700"
                        title="Remove image"
                    >
                        ×
                    </button>
                </div>
            )}
            {!isImage && value && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                    <FileText size={14} />
                    <span className="truncate">{value.split('/').pop()}</span>
                </div>
            )}
            <div className="flex">
                <input
                    type="text"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Paste URL or upload from device →"
                    className="flex-1 min-w-0 border border-slate-300 dark:border-slate-600 rounded-l-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-600/30 border-r-0"
                />
                <button
                    type="button"
                    disabled={uploading}
                    onClick={() => !uploading && inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const f = e.dataTransfer.files?.[0];
                        if (f) handleFile(f);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border border-slate-300 dark:border-slate-600 rounded-r-lg cursor-pointer transition-colors ${
                        dragOver
                            ? 'bg-navy-600 text-white border-navy-600'
                            : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                    } ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                    <Upload size={14} />
                    {uploading ? 'Uploading…' : 'Upload'}
                </button>
            </div>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = '';
                }}
                className="hidden"
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────
// Multi-Image Upload
// ─────────────────────────────────────────────────────────

function MultiImageUpload({
    value,
    onChange,
}: {
    value: string | string[] | null;
    onChange: (json: string) => void;
}) {
    const [uploading, setUploading] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const urls: string[] = (() => {
        if (!value) return [];
        if (Array.isArray(value)) return value.filter(Boolean);
        try { return JSON.parse(value).filter(Boolean); } catch { return []; }
    })();

    function emit(next: string[]) {
        onChange(JSON.stringify(next));
    }

    function remove(idx: number) {
        emit(urls.filter((_, i) => i !== idx));
    }

    function addUrl() {
        const trimmed = urlInput.trim();
        if (!trimmed) return;
        emit([...urls, trimmed]);
        setUrlInput('');
    }

    async function handleFile(file: File) {
        setUploading(true);
        try {
            const url = await uploadFile(file);
            emit([...urls, url]);
        } catch {
            alert('Upload failed. Please check the file type and try again.');
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Thumbnail grid */}
            {urls.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                    {urls.map((url, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 aspect-video">
                            <img src={url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => remove(idx)}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold leading-none"
                                title="Remove"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {/* URL input row */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
                    placeholder="Paste image URL and press Add…"
                    className="flex-1 min-w-0 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-600/30"
                />
                <button
                    type="button"
                    onClick={addUrl}
                    disabled={!urlInput.trim()}
                    className="px-3 py-2 text-sm font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg transition-colors disabled:opacity-40"
                >
                    Add
                </button>
                <button
                    type="button"
                    disabled={uploading}
                    onClick={() => !uploading && inputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/40 hover:border-navy-400 transition-colors disabled:opacity-60"
                >
                    <Upload size={14} />
                    {uploading ? 'Uploading…' : 'Upload'}
                </button>
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = '';
                }}
                className="hidden"
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────

function Pagination({ meta, onPage }: { meta: PaginationMeta; onPage: (p: number) => void }) {
    if (meta.last_page <= 1) return null;
    const btnCls =
        'flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors';

    return (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <button
                className={btnCls}
                disabled={meta.current_page === 1}
                onClick={() => onPage(meta.current_page - 1)}
            >
                <ChevronLeft size={15} />
            </button>
            <span className="text-xs text-slate-500 font-semibold">
                {meta.current_page} / {meta.last_page}
            </span>
            <button
                className={btnCls}
                disabled={meta.current_page === meta.last_page}
                onClick={() => onPage(meta.current_page + 1)}
            >
                <ChevronRight size={15} />
            </button>
            <span className="text-xs text-slate-400 ml-auto">{meta.total} records</span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────
// Toggle switch
// ─────────────────────────────────────────────────────────

function Toggle({ checked, onChange, small = false }: { checked: boolean; onChange: (v: boolean) => void; small?: boolean }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-navy-600/40 ${
                checked ? 'bg-navy-600' : 'bg-slate-300 dark:bg-slate-600'
            } ${small ? 'h-3.5 w-6' : 'h-6 w-11'}`}
        >
            <span
                className={`inline-block transform rounded-full bg-white shadow transition-transform ${
                    small
                        ? `h-2.5 w-2.5 ${checked ? 'translate-x-[13px]' : 'translate-x-px'}`
                        : `h-4 w-4 ${checked ? 'translate-x-6' : 'translate-x-1'}`
                }`}
            />
        </button>
    );
}

// ─────────────────────────────────────────────────────────
// Nav resources
// ─────────────────────────────────────────────────────────

const navResources = [
    { id: 'pages',     label: 'Pages',     Icon: FileText },
    { id: 'services',  label: 'Services',  Icon: Wrench },
    { id: 'projects',  label: 'Projects',  Icon: BriefcaseBusiness },
    { id: 'staff',     label: 'Staff',     Icon: UsersRound },
    { id: 'news',      label: 'News',      Icon: Newspaper },
    { id: 'gallery',   label: 'Gallery',   Icon: BookOpen },
    { id: 'documents', label: 'Documents', Icon: FolderOpen },
    { id: 'settings',  label: 'Settings',  Icon: Settings },
];

// ─────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────

function Login({ onLogin }: { onLogin: (user: AuthUser) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function submit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await api('/api/admin/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            onLogin(data.user);
        } catch {
            setError('Invalid email or password.');
        } finally {
            setLoading(false);
        }
    }

    const inputCls =
        'w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600/40';

    return (
        <main className="min-h-screen grid place-items-center p-6 bg-gradient-to-br from-navy-800 to-navy-600">
            <section className="w-full max-w-3xl grid grid-cols-[1fr_0.9fr] overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_rgba(2,20,40,0.28)]">
                {/* Brand panel */}
                <div className="flex flex-col justify-center gap-5 p-12 bg-slate-50 border-r border-slate-200">
                    <img src="/logo.png" alt="DIT ICB" className="w-20 h-20 object-contain" />
                    <div>
                        <span className="text-navy-600 text-xs font-extrabold uppercase tracking-widest">DIT ICB</span>
                        <strong className="block mt-2 text-navy-800 text-3xl font-extrabold leading-tight">
                            Content Management System
                        </strong>
                    </div>
                </div>
                {/* Form panel */}
                <form onSubmit={submit} className="flex flex-col justify-center gap-4 p-10">
                    <h1 className="text-2xl font-extrabold text-navy-800">Admin sign in</h1>
                    <p className="text-sm text-slate-500 leading-relaxed -mt-1">
                        Manage bureau content, projects, services, staff profiles, and more.
                    </p>
                    {error && (
                        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3">
                            {error}
                        </div>
                    )}
                    <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                            className={inputCls}
                        />
                    </label>
                    <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={inputCls}
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-navy-600 hover:bg-navy-700 text-white font-bold rounded-lg transition-colors disabled:opacity-60"
                    >
                        {loading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>
            </section>
        </main>
    );
}

// ─────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────

function Sidebar({
    active,
    setActive,
    onLogout,
    user,
}: {
    active: string;
    setActive: (v: string) => void;
    onLogout: () => void;
    user: AuthUser;
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!menuOpen) return;
        function onOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', onOutside);
        return () => document.removeEventListener('mousedown', onOutside);
    }, [menuOpen]);

    const initials = user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    function navBtn(id: string) {
        const isActive = active === id;
        return `relative flex items-center gap-2.5 w-full text-left border-0 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
            isActive
                ? 'bg-navy-600/10 text-navy-700 dark:bg-white/10 dark:text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/6 dark:hover:text-slate-200'
        }`;
    }

    function goTo(id: string) {
        setActive(id);
        setMenuOpen(false);
    }


    return (
        <aside className="flex flex-col h-screen bg-white dark:bg-[#0d1e32] border-r border-slate-200 dark:border-white/[0.06]">

            {/* Brand */}
            <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-200 dark:border-white/[0.06] shrink-0">
                <div className="w-8 h-8 rounded-lg bg-navy-600 flex items-center justify-center shrink-0 overflow-hidden">
                    <img src="/logo.png" alt="DIT ICB" className="w-full h-full object-contain p-0.5" />
                </div>
                <div>
                    <strong className="block text-slate-900 dark:text-white text-[13px] font-extrabold tracking-tight leading-none">DIT ICB</strong>
                    <span className="block text-slate-400 dark:text-slate-500 text-[11px] mt-0.5">Admin Panel</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <button className={navBtn('dashboard')} onClick={() => goTo('dashboard')}>
                    {active === 'dashboard' && <span className="absolute left-0 inset-y-1.5 w-0.5 rounded-full bg-gold-400" />}
                    <LayoutDashboard size={16} />
                    Dashboard
                </button>

                {navResources.map(({ id, label, Icon }) => (
                    <button key={id} className={navBtn(id)} onClick={() => goTo(id)}>
                        {active === id && <span className="absolute left-0 inset-y-1.5 w-0.5 rounded-full bg-gold-400" />}
                        <Icon size={16} />
                        {label}
                    </button>
                ))}

                <button className={navBtn('users')} onClick={() => goTo('users')}>
                    {active === 'users' && <span className="absolute left-0 inset-y-1.5 w-0.5 rounded-full bg-gold-400" />}
                    <Users size={16} />
                    Users
                </button>
            </nav>

            {/* User block at bottom */}
            <div ref={menuRef} className="relative px-3 pb-4 pt-3 border-t border-slate-200 dark:border-white/[0.06] shrink-0">

                {/* Popup menu — floats above the user button */}
                {menuOpen && (
                    <div className="absolute bottom-[calc(100%-4px)] left-3 right-3 bg-white dark:bg-[#152336] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                        {/* User info */}
                        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-white/[0.08]">
                            <div className="w-9 h-9 rounded-full bg-navy-600 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <p className="text-slate-900 dark:text-white font-bold text-sm leading-tight truncate">{user.name}</p>
                                <p className="text-slate-400 text-[11px] truncate mt-0.5">{user.email}</p>
                            </div>
                        </div>

                        {/* Menu items */}
                        <div className="p-1.5 flex flex-col">
                            <button
                                onClick={() => goTo('users')}
                                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/8 rounded-lg transition-colors text-left w-full"
                            >
                                <UserRound size={14} className="shrink-0" /> Profile
                            </button>
                            <button
                                onClick={() => goTo('settings')}
                                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/8 rounded-lg transition-colors text-left w-full"
                            >
                                <Settings size={14} className="shrink-0" /> Settings
                            </button>
                            <a
                                href="/"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/8 rounded-lg transition-colors"
                            >
                                <ExternalLink size={14} className="shrink-0" /> View website
                            </a>
                        </div>

                        <div className="p-1.5 border-t border-slate-100 dark:border-white/[0.08]">
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors w-full text-left"
                            >
                                <LogOut size={14} className="shrink-0" /> Sign out
                            </button>
                        </div>
                    </div>
                )}

                {/* Trigger */}
                <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors border-0 cursor-pointer ${
                        menuOpen ? 'bg-slate-100 dark:bg-white/10' : 'hover:bg-slate-100 dark:hover:bg-white/6'
                    }`}
                >
                    <div className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center text-white font-extrabold text-xs shrink-0">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-slate-900 dark:text-white text-[13px] font-semibold leading-tight truncate">{user.name}</p>
                        <p className="text-slate-400 dark:text-slate-500 text-[11px] truncate mt-0.5">{user.email}</p>
                    </div>
                    <ChevronUp
                        size={14}
                        className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ${menuOpen ? '' : 'rotate-180'}`}
                    />
                </button>
            </div>
        </aside>
    );
}

// ─────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────

function Dashboard({ setActive }: { setActive: (v: string) => void }) {
    const [data, setData] = useState<DashboardData | null>(null);

    useEffect(() => {
        api('/api/admin/dashboard').then(setData);
    }, []);

    if (!data)
        return (
            <div className="flex items-center justify-center h-40 text-slate-400">
                <Spinner /> <span className="ml-3">Loading dashboard…</span>
            </div>
        );

    const statIcon: Record<string, any> = {
        pages: FileText,
        services: Wrench,
        projects: FolderOpen,
        staff: UsersRound,
        news: Newspaper,
        documents: BookOpen,
    };
    const statColor: Record<string, { icon: string; bg: string; dot: string }> = {
        pages:     { icon: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20',    dot: 'bg-blue-500' },
        services:  { icon: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20', dot: 'bg-violet-500' },
        projects:  { icon: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/20',   dot: 'bg-amber-500' },
        staff:     { icon: 'text-emerald-600 dark:text-emerald-400',bg: 'bg-emerald-50 dark:bg-emerald-900/20',dot:'bg-emerald-500'},
        news:      { icon: 'text-rose-600 dark:text-rose-400',     bg: 'bg-rose-50 dark:bg-rose-900/20',     dot: 'bg-rose-500' },
        documents: { icon: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20', dot: 'bg-indigo-500' },
    };

    return (
        <div className="grid gap-5">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {data.stats.filter((s) => s.resource !== 'news').map((stat) => {
                    const Icon = statIcon[stat.resource] ?? FileText;
                    const clr = statColor[stat.resource] ?? statColor.pages;
                    return (
                        <button
                            key={stat.label}
                            onClick={() => setActive(stat.resource)}
                            className="group bg-white dark:bg-slate-800 border border-border-light dark:border-slate-700/50 rounded-xl p-5 text-left shadow-card hover:shadow-card-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 leading-snug pr-2">
                                    {stat.label}
                                </span>
                                <span className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center ${clr.bg} ${clr.icon}`}>
                                    <Icon size={17} />
                                </span>
                            </div>
                            <p className="text-[1.5rem] font-bold text-slate-700 dark:text-slate-200 leading-none tracking-tight">
                                {stat.value.toLocaleString()}
                            </p>
                            <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500 leading-snug">
                                {stat.meta}
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* Health + Recent */}
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-white dark:bg-slate-800 border border-border-light dark:border-slate-700/50 rounded-xl p-5 shadow-card">
                    <span className="text-navy-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-widest">Publishing readiness</span>
                    <h2 className="mt-1 text-base font-extrabold text-navy-800 dark:text-slate-100 mb-4">Content health</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {data.health.map((check) => (
                            <div key={check.label} className="border border-slate-100 dark:border-slate-700 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-1">
                                    <strong className="text-xs font-bold text-slate-700 dark:text-slate-300">{check.label}</strong>
                                    <span className={`text-[10px] font-bold ${check.percent >= 100 ? 'text-green-600' : 'text-amber-600'}`}>
                                        {check.status}
                                    </span>
                                </div>
                                <p className="text-sm font-extrabold text-navy-800 dark:text-slate-100 mb-2">
                                    {check.value} / {check.target}
                                </p>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: `${check.percent}%`,
                                            background: check.percent >= 100 ? '#16a34a' : '#0f5ea8',
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-span-2">
                    <RecentList
                        title="Recent projects"
                        items={data.projects.map((p) => ({
                            title: p.title,
                            meta: `${p.client} · ${p.status}`,
                            published: p.published,
                        }))}
                    />
                </div>
            </div>
        </div>
    );
}

function RecentList({ title, items }: { title: string; items: { title: string; meta: string; published: boolean }[] }) {
    return (
        <div className="bg-white dark:bg-slate-800 border border-border-light dark:border-slate-700/50 rounded-xl p-5 shadow-card">
            <h2 className="text-base font-extrabold text-navy-800 dark:text-slate-100 mb-3">{title}</h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {items.map((item) => (
                    <div key={item.title} className="flex items-center justify-between gap-3 py-2.5">
                        <div>
                            <strong className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">{item.title}</strong>
                            <span className="text-xs text-slate-400 dark:text-slate-500">{item.meta}</span>
                        </div>
                        {item.published ? (
                            <CheckCircle2 size={17} className="text-green-500 shrink-0" />
                        ) : (
                            <XCircle size={17} className="text-amber-400 shrink-0" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────
// Field input rendering
// ─────────────────────────────────────────────────────────

const inputCls =
    'w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-600/30';

function FieldInput({
    field,
    value,
    onChange,
}: {
    field: Field;
    value: any;
    onChange: (v: any) => void;
}) {
    if (field.type === 'boolean') {
        return <Toggle checked={Boolean(value)} onChange={onChange} />;
    }

    if (field.type === 'richtext') {
        return <RichTextEditor value={value ?? ''} onChange={onChange} />;
    }

    if (field.type === 'image') {
        return (
            <FileUpload
                value={value ?? ''}
                onChange={onChange}
                accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                isImage
            />
        );
    }

    if (field.type === 'file') {
        return (
            <FileUpload
                value={value ?? ''}
                onChange={onChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                isImage={false}
            />
        );
    }

    if (field.type === 'images') {
        return (
            <MultiImageUpload
                value={value ?? null}
                onChange={onChange}
            />
        );
    }

    if (field.type === 'select' && field.options) {
        return (
            <select
                value={value ?? ''}
                required={field.required}
                onChange={(e) => onChange(e.target.value)}
                className={inputCls}
            >
                <option value="">— Select —</option>
                {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                ))}
            </select>
        );
    }

    if (field.type === 'textarea') {
        return (
            <textarea
                value={value ?? ''}
                required={field.required}
                rows={3}
                onChange={(e) => onChange(e.target.value)}
                className={inputCls}
            />
        );
    }

    return (
        <input
            type={
                field.type === 'number'
                    ? 'number'
                    : field.type === 'datetime'
                    ? 'datetime-local'
                    : 'text'
            }
            value={value ?? ''}
            required={field.required}
            onChange={(e) => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
            className={inputCls}
        />
    );
}

// ─────────────────────────────────────────────────────────
// Record Form
// ─────────────────────────────────────────────────────────

const wideFieldTypes: FieldType[] = ['richtext', 'image', 'file', 'textarea', 'images'];

function RecordForm({
    config,
    item,
    onSave,
    onDelete,
    saving,
}: {
    config: ResourceConfig;
    item: ResourceItem;
    onSave: (item: ResourceItem) => Promise<void>;
    onDelete?: (item: ResourceItem) => Promise<void>;
    saving: boolean;
}) {
    const [draft, setDraft] = useState<ResourceItem>(item);
    const [deleting, setDeleting] = useState(false);
    const isNew = !draft.id;

    useEffect(() => {
        setDraft(item);
    }, [item]);

    function setField(name: string, value: any) {
        let next = setNested(draft, name, value) as ResourceItem;
        // Auto-generate slug for new records
        if (isNew && (name === 'title.en' || name === 'name')) {
            const hasSlug = config.fields.some((f) => f.name === 'slug');
            if (hasSlug) {
                next = setNested(next, 'slug', slugify(String(value))) as ResourceItem;
            }
        }
        setDraft(next);
    }

    async function handleDelete() {
        if (!onDelete) return;
        setDeleting(true);
        try {
            await onDelete(draft);
        } finally {
            setDeleting(false);
        }
    }

    const booleanFields = config.fields.filter((f) => f.type === 'boolean');
    const otherFields   = config.fields.filter((f) => f.type !== 'boolean');

    function boolColor(name: string, active: boolean) {
        if (!active) return {
            card: 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
            label: 'text-slate-400 dark:text-slate-500',
            dot: 'bg-slate-300 dark:bg-slate-600',
            hint: 'text-slate-400 dark:text-slate-500',
        };
        if (name === 'is_published') return {
            card: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40',
            label: 'text-emerald-700 dark:text-emerald-400',
            dot: 'bg-emerald-500',
            hint: 'text-emerald-500 dark:text-emerald-500',
        };
        if (name === 'is_featured') return {
            card: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40',
            label: 'text-amber-700 dark:text-amber-400',
            dot: 'bg-amber-500',
            hint: 'text-amber-500 dark:text-amber-500',
        };
        return {
            card: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40',
            label: 'text-blue-700 dark:text-blue-400',
            dot: 'bg-blue-500',
            hint: 'text-blue-500 dark:text-blue-500',
        };
    }

    return (
        <form
            className="flex flex-col gap-5"
            onSubmit={(e) => { e.preventDefault(); onSave(draft); }}
        >
            {/* Form header with inline status chips */}
            <div className="flex items-center justify-between gap-4">
                <span className="text-navy-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-widest">
                    {isNew ? 'New record' : `Record #${draft.id}`}
                </span>
                {booleanFields.length > 0 && (
                    <div className="flex items-center gap-2">
                        {booleanFields.map((field) => {
                            const val = Boolean(getNested(draft, field.name));
                            const c = boolColor(field.name, val);
                            return (
                                <div key={field.name} className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${val ? c.dot : 'bg-slate-300 dark:bg-slate-600'}`} />
                                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                        {field.label}
                                    </span>
                                    <Toggle checked={val} onChange={(v) => setField(field.name, v)} small />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Content fields (non-boolean) */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                {otherFields.map((field) => (
                    <label
                        key={field.name}
                        className={`flex flex-col gap-1.5 ${wideFieldTypes.includes(field.type) ? 'col-span-2' : ''}`}
                    >
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-0.5">*</span>}
                        </span>
                        <FieldInput
                            field={field}
                            value={getNested(draft, field.name)}
                            onChange={(v) => setField(field.name, v)}
                        />
                    </label>
                ))}
            </div>

            {/* Action bar at bottom */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                {onDelete && draft.id > 0 && (
                    <button
                        type="button"
                        disabled={deleting}
                        onClick={handleDelete}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/40 rounded-lg transition-colors disabled:opacity-60"
                    >
                        <Trash2 size={15} />
                        {deleting ? 'Deleting…' : 'Delete'}
                    </button>
                )}
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white bg-navy-600 hover:bg-navy-700 rounded-lg transition-colors disabled:opacity-60"
                >
                    <Save size={15} />
                    {saving ? 'Saving…' : 'Save changes'}
                </button>
            </div>
        </form>
    );
}

// ─────────────────────────────────────────────────────────
// Spinner
// ─────────────────────────────────────────────────────────

function Spinner() {
    return (
        <span className="inline-block w-5 h-5 border-2 border-slate-200 border-t-navy-600 rounded-full animate-spin" />
    );
}

// ─────────────────────────────────────────────────────────
// Resource Manager
// ─────────────────────────────────────────────────────────

function ResourceManager({ resource }: { resource: string }) {
    const { show } = useToast();
    const [config, setConfig] = useState<ResourceConfig | null>(null);
    const [items, setItems] = useState<ResourceItem[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [editing, setEditing] = useState<ResourceItem | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    async function load(p = page, s = search) {
        setLoading(true);
        try {
            const data = await api(
                `/api/admin/resources/${resource}?search=${encodeURIComponent(s)}&page=${p}`
            );
            setConfig(data.config);
            setItems(data.items.data);
            setMeta(data.items);
        } catch (e: any) {
            show('error', e.message || 'Failed to load content.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setSearch('');
        setPage(1);
        setEditing(null);
        load(1, '');
    }, [resource]);

    async function save(item: ResourceItem) {
        setSaving(true);
        try {
            const isNew = !item.id;
            const data = await api(
                `/api/admin/resources/${resource}${isNew ? '' : `/${item.id}`}`,
                { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(item) }
            );
            setEditing(data.item);
            show('success', `Record ${isNew ? 'created' : 'updated'} successfully.`);
            await load();
        } catch (e: any) {
            show('error', e.message || 'Failed to save record.');
        } finally {
            setSaving(false);
        }
    }

    async function remove(item: ResourceItem) {
        if (!confirm(`Delete "${item.display_title ?? 'this record'}"?`)) return;
        try {
            await api(`/api/admin/resources/${resource}/${item.id}`, { method: 'DELETE' });
            show('success', 'Record deleted.');
            setEditing(null);
            await load();
        } catch (e: any) {
            show('error', e.message || 'Failed to delete record.');
        }
    }

    function handlePage(p: number) {
        setPage(p);
        load(p, search);
    }

    if (!config && loading) {
        return (
            <div className="flex items-center justify-center h-40 text-slate-400">
                <Spinner /> <span className="ml-3">Loading content…</span>
            </div>
        );
    }
    if (!config) return null;

    return (
        <div className="grid gap-5">
            {/* Page header */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-navy-800 dark:text-slate-100">{config.title}</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{config.description}</p>
                </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)] gap-4 items-start">
                {/* Record list — sticky so it stays visible while the form scrolls */}
                <div className="sticky top-0 bg-white dark:bg-slate-800 border border-border-light dark:border-slate-700/50 rounded-xl p-4 shadow-card">
                    <div className="flex gap-2 mb-3">
                        <div className="flex flex-1 items-center gap-2 border border-slate-300 dark:border-slate-600 rounded-lg px-3 bg-white dark:bg-slate-700">
                            <Search size={15} className="text-slate-400 shrink-0" />
                            <input
                                value={search}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setSearch(v);
                                    clearTimeout((window as any).__searchTimer);
                                    (window as any).__searchTimer = setTimeout(() => {
                                        setPage(1);
                                        load(1, v);
                                    }, 350);
                                }}
                                placeholder="Search records…"
                                className="flex-1 py-2 text-sm outline-none bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                            />
                        </div>
                        <button
                            onClick={() => setEditing({ id: 0 })}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-navy-600 hover:bg-navy-700 text-white text-sm font-bold rounded-lg transition-colors shrink-0"
                        >
                            <Plus size={15} /> New
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8"><Spinner /></div>
                    ) : (
                        <>
                            {items.length === 0 ? (
                                <p className="text-center text-sm text-slate-400 py-8">No records found.</p>
                            ) : (
                                <div className="flex flex-col gap-1.5 max-h-[65vh] overflow-y-auto pr-0.5">
                                    {items.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setEditing(item)}
                                            className={`flex items-center justify-between gap-3 w-full text-left px-3 py-2.5 rounded-lg border transition-colors cursor-pointer ${
                                                editing?.id === item.id
                                                    ? 'border-navy-600/40 bg-brand-sky dark:bg-navy-900/40'
                                                    : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                            }`}
                                        >
                                            <div className="min-w-0">
                                                <strong className="block text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                    {item.display_title ?? item.name ?? item.slug ?? item.key}
                                                </strong>
                                                <span className="text-xs text-slate-400 dark:text-slate-500">#{item.id}</span>
                                            </div>
                                            {item.is_published === false ? (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 shrink-0">
                                                    Draft
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800 shrink-0">
                                                    Live
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {meta && <Pagination meta={meta} onPage={handlePage} />}
                        </>
                    )}
                </div>

                {/* Form panel */}
                <div className="bg-white dark:bg-slate-800 border border-border-light dark:border-slate-700/50 rounded-xl p-5 shadow-card">
                    {editing ? (
                        <RecordForm
                            config={config}
                            item={editing}
                            onSave={save}
                            onDelete={editing.id ? remove : undefined}
                            saving={saving}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400 dark:text-slate-500">
                            <FileText size={36} strokeWidth={1.2} />
                            <h2 className="text-base font-extrabold text-slate-600 dark:text-slate-400">Select a record</h2>
                            <p className="text-sm text-center">Choose an existing item or create a new record.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────
// User Manager
// ─────────────────────────────────────────────────────────

function UserManager() {
    const { show } = useToast();
    const [users, setUsers] = useState<AdminUserRecord[]>([]);
    const [editing, setEditing] = useState<AdminUserRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    async function load() {
        setLoading(true);
        try {
            const data = await api('/api/admin/users');
            setUsers(data.users);
        } catch {
            show('error', 'Failed to load users.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function save(draft: { id: number; name: string; email: string; password?: string; is_admin: boolean }) {
        setSaving(true);
        try {
            const isNew = !draft.id;
            const data = await api(isNew ? '/api/admin/users' : `/api/admin/users/${draft.id}`, {
                method: isNew ? 'POST' : 'PUT',
                body: JSON.stringify(draft),
            });
            setEditing(data.user);
            show('success', `User ${isNew ? 'created' : 'updated'} successfully.`);
            await load();
        } catch (e: any) {
            show('error', e.message || 'Failed to save user.');
        } finally {
            setSaving(false);
        }
    }

    async function remove(user: AdminUserRecord) {
        if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
        try {
            await api(`/api/admin/users/${user.id}`, { method: 'DELETE' });
            show('success', 'User deleted.');
            setEditing(null);
            await load();
        } catch (e: any) {
            show('error', e.message || 'Cannot delete this user.');
        }
    }

    return (
        <div className="grid gap-5">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <span className="text-navy-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-widest">Administration</span>
                    <h1 className="mt-0.5 text-2xl font-extrabold text-navy-800 dark:text-slate-100">Users</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage administrator accounts with access to this CMS.</p>
                </div>
                <button
                    onClick={() => setEditing({ id: 0, name: '', email: '', is_admin: true })}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-600 hover:bg-navy-700 text-white text-sm font-bold rounded-lg transition-colors shrink-0"
                >
                    <Plus size={17} /> New user
                </button>
            </div>

            <div className="grid grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)] gap-4 items-start">
                {/* User list */}
                <div className="bg-white dark:bg-slate-800 border border-border-light dark:border-slate-700/50 rounded-xl p-4 shadow-card">
                    {loading ? (
                        <div className="flex justify-center py-8"><Spinner /></div>
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            {users.map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => setEditing(u)}
                                    className={`flex items-center justify-between gap-3 w-full text-left px-3 py-2.5 rounded-lg border transition-colors cursor-pointer ${
                                        editing?.id === u.id
                                            ? 'border-navy-600/40 bg-brand-sky dark:bg-navy-900/40'
                                            : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    }`}
                                >
                                    <div className="min-w-0">
                                        <strong className="block text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{u.name}</strong>
                                        <span className="text-xs text-slate-400 dark:text-slate-500 truncate block">{u.email}</span>
                                    </div>
                                    {u.is_admin ? (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-navy-600/10 text-navy-700 shrink-0">
                                            Admin
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
                                            User
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* User form */}
                <div className="bg-white dark:bg-slate-800 border border-border-light dark:border-slate-700/50 rounded-xl p-5 shadow-card">
                    {editing ? (
                        <UserForm
                            user={editing}
                            onSave={save}
                            onDelete={editing.id ? remove : undefined}
                            saving={saving}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400 dark:text-slate-500">
                            <UserRound size={36} strokeWidth={1.2} />
                            <h2 className="text-base font-extrabold text-slate-600 dark:text-slate-400">Select a user</h2>
                            <p className="text-sm">Choose a user to edit or create a new account.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function UserForm({
    user,
    onSave,
    onDelete,
    saving,
}: {
    user: AdminUserRecord;
    onSave: (d: any) => Promise<void>;
    onDelete?: (u: AdminUserRecord) => Promise<void>;
    saving: boolean;
}) {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(user.is_admin);
    const [deleting, setDeleting] = useState(false);
    const isNew = !user.id;

    useEffect(() => {
        setName(user.name);
        setEmail(user.email);
        setPassword('');
        setIsAdmin(user.is_admin);
    }, [user]);

    async function handleDelete() {
        if (!onDelete) return;
        setDeleting(true);
        try { await onDelete(user); } finally { setDeleting(false); }
    }

    return (
        <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
                e.preventDefault();
                onSave({ id: user.id, name, email, password: password || undefined, is_admin: isAdmin });
            }}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <span className="text-navy-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-widest">
                        {isNew ? 'New user' : `User #${user.id}`}
                    </span>
                    <h2 className="mt-0.5 text-lg font-extrabold text-navy-800 dark:text-slate-100">
                        {isNew ? 'Create account' : user.name}
                    </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {onDelete && (
                        <button
                            type="button"
                            disabled={deleting}
                            onClick={handleDelete}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60"
                        >
                            <Trash2 size={15} />
                            {deleting ? 'Deleting…' : 'Delete'}
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-navy-600 hover:bg-navy-700 rounded-lg transition-colors disabled:opacity-60"
                    >
                        <Save size={15} />
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Name <span className="text-red-500">*</span></span>
                    <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
                </label>
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email <span className="text-red-500">*</span></span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
                </label>
                <label className="flex flex-col gap-1.5 col-span-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {isNew ? 'Password *' : 'New password (leave blank to keep current)'}
                    </span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required={isNew}
                        minLength={8}
                        autoComplete="new-password"
                        className={inputCls}
                    />
                </label>
                <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Administrator</span>
                    <Toggle checked={isAdmin} onChange={setIsAdmin} />
                </label>
            </div>
        </form>
    );
}

// ─────────────────────────────────────────────────────────
// Root App
// ─────────────────────────────────────────────────────────

function AdminApp() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [checking, setChecking] = useState(true);
    const [active, setActive] = useState('dashboard');
    const [isDark, setIsDark] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('admin-theme');
        const dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(dark);
        document.documentElement.classList.toggle('dark', dark);
    }, []);

    function toggleTheme() {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.classList.toggle('dark', next);
        localStorage.setItem('admin-theme', next ? 'dark' : 'light');
    }

    useEffect(() => {
        api('/api/admin/me')
            .then((d) => setUser(d.user))
            .catch(() => setUser(null))
            .finally(() => setChecking(false));
    }, []);

    async function logout() {
        await api('/api/admin/logout', { method: 'POST' });
        setUser(null);
    }

    const pageTitle = useMemo(() => {
        if (active === 'dashboard') return 'Dashboard';
        if (active === 'users') return 'Users';
        return navResources.find((r) => r.id === active)?.label ?? 'Dashboard';
    }, [active]);

    if (checking) {
        return (
            <main className="min-h-screen grid place-items-center bg-slate-100">
                <Spinner />
            </main>
        );
    }

    if (!user) return <Login onLogin={setUser} />;

    return (
        <ToastProvider>
            <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
                {/* Fixed sidebar — width transitions on toggle */}
                <div className={`shrink-0 h-screen overflow-hidden transition-[width] duration-300 ease-in-out ${sidebarOpen ? 'w-[260px]' : 'w-0'}`}>
                    <Sidebar active={active} setActive={setActive} onLogout={logout} user={user} />
                </div>

                {/* Main area */}
                <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">

                    {/* Sticky topbar */}
                    <header className="h-16 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between px-6 z-10">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen((v) => !v)}
                                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors border-0 cursor-pointer"
                                title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                            >
                                <PanelLeft size={18} />
                            </button>
                            <h1 className="text-[17px] font-extrabold text-navy-800 dark:text-slate-100 leading-tight">{pageTitle}</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href="/"
                                target="_blank"
                                rel="noreferrer"
                                className="hidden md:inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 dark:text-slate-400 hover:text-navy-700 dark:hover:text-slate-200 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <ExternalLink size={13} /> View website
                            </a>
                            <button
                                onClick={toggleTheme}
                                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors border-0 cursor-pointer"
                                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {isDark ? <Sun size={17} /> : <Moon size={17} />}
                            </button>
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors border-0 cursor-pointer">
                                <Bell size={17} />
                            </button>
                        </div>
                    </header>

                    {/* Scrollable content */}
                    <main className="flex-1 overflow-y-auto p-6 dark:bg-slate-950">
                        {active === 'dashboard' && <Dashboard setActive={setActive} />}
                        {active === 'users' && <UserManager />}
                        {active !== 'dashboard' && active !== 'users' && <ResourceManager resource={active} />}
                    </main>
                </div>
            </div>
        </ToastProvider>
    );
}

createRoot(document.getElementById('admin-root')!).render(<AdminApp />);
