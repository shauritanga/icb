import '../css/app.css';

import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
    BookOpen,
    BriefcaseBusiness,
    CheckCircle2,
    FileText,
    FolderOpen,
    LayoutDashboard,
    LogOut,
    Newspaper,
    Plus,
    Save,
    Search,
    Settings,
    Trash2,
    UserRound,
    UsersRound,
    Wrench,
    XCircle,
} from 'lucide-react';

type User = { name: string; email: string };
type Field = { name: string; label: string; type: 'text' | 'textarea' | 'richtext' | 'number' | 'boolean' | 'datetime'; required?: boolean };
type ResourceConfig = { resource: string; title: string; description: string; fields: Field[] };
type ResourceItem = Record<string, any> & { id: number; display_title?: string; is_published?: boolean };
type DashboardData = {
    stats: { label: string; value: number; meta: string; resource: string }[];
    health: { label: string; value: number; target: number; percent: number; status: string; resource: string }[];
    projects: { title: string; client: string; status: string; published: boolean }[];
    news: { title: string; date: string; published: boolean }[];
};

const csrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

async function api(path: string, options: RequestInit = {}) {
    const response = await fetch(path, {
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrf(),
            ...(options.headers ?? {}),
        },
        ...options,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed with ${response.status}`);
    }

    return response.json();
}

const resources = [
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'projects', label: 'Projects', icon: BriefcaseBusiness },
    { id: 'staff', label: 'Staff', icon: UsersRound },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'gallery', label: 'Gallery', icon: BookOpen },
    { id: 'documents', label: 'Documents', icon: FolderOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
];

function getNested(data: Record<string, any>, path: string) {
    return path.split('.').reduce((carry, key) => carry?.[key], data) ?? '';
}

function setNested(data: Record<string, any>, path: string, value: any) {
    const next = structuredClone(data);
    const keys = path.split('.');
    let cursor = next;

    keys.slice(0, -1).forEach((key) => {
        cursor[key] ??= {};
        cursor = cursor[key];
    });

    cursor[keys[keys.length - 1]] = value;
    return next;
}

function Login({ onLogin }: { onLogin: (user: User) => void }) {
    const [email, setEmail] = useState('admin@diticb.test');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function submit(event: FormEvent) {
        event.preventDefault();
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

    return (
        <main className="admin-login">
            <section className="admin-login-panel">
                <div className="admin-login-brand">
                    <img src="/logo.png" alt="DIT ICB" />
                    <div>
                        <span>DIT ICB</span>
                        <strong>Content Management System</strong>
                    </div>
                </div>
                <form onSubmit={submit} className="admin-login-form">
                    <h1>Admin sign in</h1>
                    <p>Manage bureau content, projects, services, staff profiles, documents, and updates.</p>
                    {error && <div className="admin-error">{error}</div>}
                    <label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required /></label>
                    <label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required /></label>
                    <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
                </form>
            </section>
        </main>
    );
}

function Sidebar({ active, setActive, onLogout, user }: { active: string; setActive: (value: string) => void; onLogout: () => void; user: User }) {
    return (
        <aside className="admin-sidebar">
            <div className="admin-brand">
                <img src="/logo.png" alt="DIT ICB" />
                <div><strong>DIT ICB CMS</strong><span>{user.name}</span></div>
            </div>
            <button className={active === 'dashboard' ? 'active' : ''} onClick={() => setActive('dashboard')}><LayoutDashboard size={18} /> Dashboard</button>
            <div className="admin-nav-label">Content</div>
            {resources.map((resource) => {
                const Icon = resource.icon;
                return <button key={resource.id} className={active === resource.id ? 'active' : ''} onClick={() => setActive(resource.id)}><Icon size={18} /> {resource.label}</button>;
            })}
            <div className="admin-sidebar-spacer" />
            <a href="/" target="_blank" rel="noreferrer">View public website</a>
            <button onClick={onLogout}><LogOut size={18} /> Sign out</button>
        </aside>
    );
}

function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);

    useEffect(() => {
        api('/api/admin/dashboard').then(setData);
    }, []);

    if (!data) return <div className="admin-card">Loading dashboard...</div>;

    return (
        <div className="admin-stack">
            <section className="admin-hero">
                <div>
                    <span>DIT ICB Content Centre</span>
                    <h1>Professional website administration</h1>
                    <p>Keep the public institution website accurate, bilingual, and publication-ready.</p>
                </div>
            </section>

            <section className="admin-stats">
                {data.stats.map((stat) => (
                    <div key={stat.label} className="admin-stat">
                        <span>{stat.label}</span>
                        <strong>{stat.value}</strong>
                        <small>{stat.meta}</small>
                    </div>
                ))}
            </section>

            <section className="admin-grid">
                <div className="admin-card span-2">
                    <div className="admin-card-head"><div><span>Publishing readiness</span><h2>Content health</h2></div></div>
                    <div className="admin-health-grid">
                        {data.health.map((check) => (
                            <div key={check.label} className="admin-health">
                                <div><strong>{check.label}</strong><span>{check.status}</span></div>
                                <p>{check.value} / {check.target}</p>
                                <div className="admin-progress"><i style={{ width: `${check.percent}%` }} /></div>
                            </div>
                        ))}
                    </div>
                </div>
                <RecentList title="Recent projects" items={data.projects.map((item) => ({ title: item.title, meta: `${item.client} · ${item.status}`, published: item.published }))} />
                <RecentList title="Latest news" items={data.news.map((item) => ({ title: item.title, meta: item.date, published: item.published }))} />
            </section>
        </div>
    );
}

function RecentList({ title, items }: { title: string; items: { title: string; meta: string; published: boolean }[] }) {
    return (
        <div className="admin-card">
            <div className="admin-card-head"><div><span>Recent activity</span><h2>{title}</h2></div></div>
            <div className="admin-list">
                {items.map((item) => (
                    <div key={item.title} className="admin-list-row">
                        <div><strong>{item.title}</strong><span>{item.meta}</span></div>
                        {item.published ? <CheckCircle2 size={18} className="ok" /> : <XCircle size={18} className="warn" />}
                    </div>
                ))}
            </div>
        </div>
    );
}

function ResourceManager({ resource }: { resource: string }) {
    const [config, setConfig] = useState<ResourceConfig | null>(null);
    const [items, setItems] = useState<ResourceItem[]>([]);
    const [editing, setEditing] = useState<ResourceItem | null>(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        const data = await api(`/api/admin/resources/${resource}?search=${encodeURIComponent(search)}`);
        setConfig(data.config);
        setItems(data.items.data);
        setEditing(null);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, [resource]);

    async function save(item: ResourceItem) {
        const isNew = !item.id;
        const data = await api(`/api/admin/resources/${resource}${isNew ? '' : `/${item.id}`}`, {
            method: isNew ? 'POST' : 'PUT',
            body: JSON.stringify(item),
        });
        setEditing(data.item);
        await load();
    }

    async function remove(item: ResourceItem) {
        if (!confirm('Delete this record?')) return;
        await api(`/api/admin/resources/${resource}/${item.id}`, { method: 'DELETE' });
        await load();
    }

    if (loading || !config) return <div className="admin-card">Loading content...</div>;

    return (
        <div className="admin-stack">
            <section className="admin-page-head">
                <div><span>Content module</span><h1>{config.title}</h1><p>{config.description}</p></div>
                <button onClick={() => setEditing({ id: 0 })}><Plus size={18} /> New record</button>
            </section>
            <div className="admin-resource-layout">
                <section className="admin-card">
                    <div className="admin-toolbar">
                        <div className="admin-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && load()} placeholder="Search records" /></div>
                        <button onClick={load}>Search</button>
                    </div>
                    <div className="admin-records">
                        {items.map((item) => (
                            <button key={item.id} className={editing?.id === item.id ? 'selected' : ''} onClick={() => setEditing(item)}>
                                <div><strong>{item.display_title ?? item.name ?? item.slug ?? item.key}</strong><span>#{item.id}</span></div>
                                {item.is_published === false ? <span className="badge draft">Draft</span> : <span className="badge live">Live</span>}
                            </button>
                        ))}
                    </div>
                </section>
                <section className="admin-card">
                    {editing ? <RecordForm config={config} item={editing} onSave={save} onDelete={editing.id ? remove : undefined} /> : <div className="admin-empty"><FileText size={36} /><h2>Select a record</h2><p>Choose an existing item or create a new record.</p></div>}
                </section>
            </div>
        </div>
    );
}

function RecordForm({ config, item, onSave, onDelete }: { config: ResourceConfig; item: ResourceItem; onSave: (item: ResourceItem) => void; onDelete?: (item: ResourceItem) => void }) {
    const [draft, setDraft] = useState<ResourceItem>(item);

    useEffect(() => setDraft(item), [item]);

    return (
        <form className="admin-form" onSubmit={(event) => { event.preventDefault(); onSave(draft); }}>
            <div className="admin-card-head">
                <div><span>{draft.id ? `Record #${draft.id}` : 'New record'}</span><h2>{draft.display_title ?? config.title}</h2></div>
                <div className="admin-form-actions">
                    {onDelete && <button type="button" className="danger" onClick={() => onDelete(draft)}><Trash2 size={17} /> Delete</button>}
                    <button type="submit"><Save size={17} /> Save</button>
                </div>
            </div>
            <div className="admin-form-grid">
                {config.fields.map((field) => (
                    <label key={field.name} className={field.type === 'richtext' ? 'wide' : ''}>
                        {field.label}
                        {renderInput(field, getNested(draft, field.name), (value) => setDraft(setNested(draft, field.name, value)))}
                    </label>
                ))}
            </div>
        </form>
    );
}

function renderInput(field: Field, value: any, setValue: (value: any) => void) {
    if (field.type === 'boolean') {
        return <input type="checkbox" checked={Boolean(value)} onChange={(event) => setValue(event.target.checked)} />;
    }

    if (field.type === 'textarea' || field.type === 'richtext') {
        return <textarea value={value ?? ''} required={field.required} rows={field.type === 'richtext' ? 8 : 3} onChange={(event) => setValue(event.target.value)} />;
    }

    return <input type={field.type === 'number' ? 'number' : field.type === 'datetime' ? 'datetime-local' : 'text'} value={value ?? ''} required={field.required} onChange={(event) => setValue(field.type === 'number' ? Number(event.target.value) : event.target.value)} />;
}

function AdminApp() {
    const [user, setUser] = useState<User | null>(null);
    const [checking, setChecking] = useState(true);
    const [active, setActive] = useState('dashboard');

    useEffect(() => {
        api('/api/admin/me').then((data) => setUser(data.user)).catch(() => setUser(null)).finally(() => setChecking(false));
    }, []);

    async function logout() {
        await api('/api/admin/logout', { method: 'POST' });
        setUser(null);
    }

    const title = useMemo(() => active === 'dashboard' ? 'Dashboard' : resources.find((item) => item.id === active)?.label ?? 'Dashboard', [active]);

    if (checking) return <main className="admin-login"><div className="admin-card">Loading admin...</div></main>;
    if (!user) return <Login onLogin={setUser} />;

    return (
        <div className="admin-shell">
            <Sidebar active={active} setActive={setActive} onLogout={logout} user={user} />
            <main className="admin-main">
                <header className="admin-topbar">
                    <div><span>DIT ICB CMS</span><h1>{title}</h1></div>
                    <div className="admin-user"><UserRound size={18} /> {user.email}</div>
                </header>
                {active === 'dashboard' ? <Dashboard /> : <ResourceManager resource={active} />}
            </main>
        </div>
    );
}

createRoot(document.getElementById('admin-root')!).render(<AdminApp />);
