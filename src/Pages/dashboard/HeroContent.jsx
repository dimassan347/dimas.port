import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../supabase'
import { useToast } from '../../hooks/useToast'
import ToastStack from '../../components/ToastStack'
import {
    X,
    ImageIcon,
    Sparkles,
    Type,
    Paintbrush,
    AlertCircle,
    Save,
} from 'lucide-react'

const HERO_FALLBACK = {
    badge_text: 'Ready to Innovate',
    title_line_1: 'Frontend',
    title_line_2: 'Developer',
    typing_words: ['Network & Telecom Student', 'Tech Enthusiast'],
    description: 'Menciptakan Website Yang Inovatif, Fungsional, dan User-Friendly untuk Solusi Digital.',
    tech_badges: ['React', 'Javascript', 'Node.js', 'Tailwind'],
    cta_buttons: [
        { label: 'Projects', url: '/#Portofolio' },
        { label: 'Contact', url: '/#Contact' },
    ],
    hero_image_url: '/Animation1.gif',
    hero_image_alt: 'Developer illustration',
}

const InputField = ({ label, value, onChange, placeholder, type = 'text', required = false, hint }) => (
    <div className="space-y-1.5">
        <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
        />
        {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
    </div>
)

const TextAreaField = ({ label, value, onChange, placeholder, rows = 4, required = false, hint }) => (
    <div className="space-y-1.5">
        <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">{label}</label>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            required={required}
            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
        />
        {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
    </div>
)

const TagInput = ({ label, value, onChange, placeholder, hint }) => {
    const [draft, setDraft] = useState('')

    useEffect(() => {
        setDraft('')
    }, [value])

    const items = useMemo(
        () => String(value || '').split(',').map((item) => item.trim()).filter(Boolean),
        [value],
    )

    const commitItem = (nextItem) => {
        const normalized = nextItem.trim().replace(/^,+|,+$/g, '')
        if (!normalized) return
        if (items.some((item) => item.toLowerCase() === normalized.toLowerCase())) return
        onChange([...items, normalized].join(', '))
    }

    const removeItem = (target) => {
        onChange(items.filter((item) => item !== target).join(', '))
    }

    return (
        <div className="space-y-1.5">
            <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">{label}</label>
            <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-3 space-y-3">
                <div className="flex flex-wrap gap-2 min-h-[38px] items-center">
                    {items.length > 0 ? items.map((item) => (
                        <span
                            key={item}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs"
                        >
                            {item}
                            <button type="button" onClick={() => removeItem(item)} className="text-indigo-200/70 hover:text-white">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )) : (
                        <p className="text-xs text-gray-600">{placeholder}</p>
                    )}
                </div>
                <input
                    type="text"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ',') {
                            event.preventDefault()
                            commitItem(draft)
                            setDraft('')
                        }
                        if (event.key === 'Backspace' && !draft && items.length > 0) {
                            onChange(items.slice(0, -1).join(', '))
                        }
                    }}
                    onBlur={() => {
                        if (draft) {
                            commitItem(draft)
                            setDraft('')
                        }
                    }}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-gray-200 placeholder-gray-600 text-sm outline-none"
                />
            </div>
            {hint ? <p className="text-[11px] text-gray-500">{hint}</p> : null}
        </div>
    )
}

export default function HeroContentDashboard() {
    const [heroItem, setHeroItem] = useState(null)
    const [form, setForm] = useState(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [saveStatus, setSaveStatus] = useState(null)
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const formRef = useRef(null)
    const { toasts, pushToast, removeToast } = useToast()

    // Fetch the hero content (should exist)
    useEffect(() => {
        const fetchHero = async () => {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('hero_contents')
                    .select('*')
                    .limit(1)
                    .maybeSingle()

                if (error) {
                    console.error('Error fetching hero content:', error)
                } else if (data) {
                    setHeroItem(data)
                    initForm(data)
                } else {
                    // No hero exists, create one with fallback
                    const { data: createdHero, error: createError } = await supabase
                        .from('hero_contents')
                        .insert([{ ...HERO_FALLBACK, is_active: true, sort_order: 0 }])
                        .select()
                        .single()

                    if (createError) throw createError
                    setHeroItem(createdHero)
                    initForm(createdHero)
                    pushToast('success', 'Default hero content created successfully!')
                }
            } catch (err) {
                console.error('Exception fetching hero:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchHero()
    }, [pushToast])

    const initForm = (heroData) => {
        setForm({
            badge_text: heroData.badge_text,
            title_line_1: heroData.title_line_1,
            title_line_2: heroData.title_line_2,
            typing_words: Array.isArray(heroData.typing_words) ? heroData.typing_words.join(', ') : '',
            description: heroData.description,
            tech_badges: Array.isArray(heroData.tech_badges) ? heroData.tech_badges.join(', ') : '',
            cta_buttons: Array.isArray(heroData.cta_buttons) ? heroData.cta_buttons : [],
            hero_image_url: heroData.hero_image_url,
            hero_image_alt: heroData.hero_image_alt,
        })
        setImagePreview(heroData.hero_image_url)
        setImageFile(null)
    }

    const set = (key) => (event) => {
        const value = event.target.value
        setForm((current) => ({ ...current, [key]: value }))
    }

    const handleImageChange = (event) => {
        const file = event.target.files[0]
        if (!file) return
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const uploadImage = async (file) => {
        const fileName = `${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('project-images').upload(`hero-content/${fileName}`, file, {
            upsert: true,
        })
        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('project-images').getPublicUrl(`hero-content/${fileName}`)
        return data.publicUrl
    }

    const normalizeList = (value) =>
        String(value || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)

    const handleSave = async () => {
        if (!form || !heroItem) return
        setUploading(true)
        setSaveStatus(null)

        try {
            const heroImageUrl = imageFile ? await uploadImage(imageFile) : form.hero_image_url

            const payload = {
                badge_text: form.badge_text.trim(),
                title_line_1: form.title_line_1.trim(),
                title_line_2: form.title_line_2.trim(),
                typing_words: normalizeList(form.typing_words),
                description: form.description.trim(),
                tech_badges: normalizeList(form.tech_badges),
                cta_buttons: (form.cta_buttons || []).map((cta) => ({
                    label: cta.label.trim(),
                    url: cta.url.trim(),
                })).filter((cta) => cta.label && cta.url),
                hero_image_url: heroImageUrl,
                hero_image_alt: form.hero_image_alt.trim(),
                is_active: true,
            }

            const { error } = await supabase
                .from('hero_contents')
                .update(payload)
                .eq('id', heroItem.id)

            if (error) throw error

            setSaveStatus({ type: 'success', message: 'Hero content saved successfully!' })
            pushToast('success', 'Hero content saved successfully!')
            setImageFile(null)

            // Re-fetch to sync state
            const { data } = await supabase
                .from('hero_contents')
                .select('*')
                .eq('id', heroItem.id)
                .single()

            if (data) {
                setHeroItem(data)
                initForm(data)
            }

            setTimeout(() => setSaveStatus(null), 3000)
        } catch (error) {
            console.error('Error saving hero content:', error)
            setSaveStatus({ type: 'error', message: error.message || 'Failed to save hero content' })
            pushToast('error', error.message || 'Failed to save hero content')
        } finally {
            setUploading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="space-y-3 text-center">
                    <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                    <p className="text-gray-400 text-sm">Loading Hero Content...</p>
                </div>
            </div>
        )
    }

    if (!form || !heroItem) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-400">Unable to load hero content</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute -inset-0.5 rounded-xl blur opacity-50" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
                        <div className="relative w-9 h-9 rounded-xl border border-white/15 flex items-center justify-center" style={{ backgroundColor: 'var(--color-backdrop-base)' }}>
                            <Paintbrush className="w-4 h-4 text-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white">Hero Section Editor</h1>
                        <p className="text-gray-500 text-xs">Customize your portfolio home hero section</p>
                    </div>
                </div>

                {/* Save Status */}
                {saveStatus && (
                    <div className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${saveStatus.type === 'success'
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/10 border border-red-500/20 text-red-300'
                        }`}>
                        {saveStatus.type === 'success' && <span>✓</span>}
                        {saveStatus.message}
                    </div>
                )}
            </div>

            {/* Info Alert */}
            <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 text-blue-100 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>This is your portfolio&apos;s hero section. All changes are automatically published to your home page in real-time.</p>
            </div>

            {/* Main Content: Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Section */}
                <div ref={formRef} className="lg:col-span-2 space-y-6">
                    {/* Badge & Titles */}
                    <div className="relative group/card">
                        <div className="absolute -inset-0.5 rounded-2xl blur opacity-10 group-hover/card:opacity-20 transition duration-500" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/12 rounded-2xl p-6 space-y-5">
                            <div className="flex items-center gap-2 mb-2 pb-3 border-b border-white/5">
                                <Type className="w-4 h-4 text-indigo-400" />
                                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Main Content</h2>
                            </div>

                            <InputField label="Badge Text" value={form.badge_text} onChange={set('badge_text')} placeholder="Ready to Innovate" required />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="Title Line 1" value={form.title_line_1} onChange={set('title_line_1')} placeholder="Frontend" required />
                                <InputField label="Title Line 2" value={form.title_line_2} onChange={set('title_line_2')} placeholder="Developer" required />
                            </div>

                            <TextAreaField label="Description" value={form.description} onChange={set('description')} placeholder="Describe your hero section" rows={3} required />
                        </div>
                    </div>

                    {/* Typing Words & Tech Badges */}
                    <div className="relative group/card">
                        <div className="absolute -inset-0.5 rounded-2xl blur opacity-10 group-hover/card:opacity-20 transition duration-500" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/12 rounded-2xl p-6 space-y-5">
                            <div className="flex items-center gap-2 mb-2 pb-3 border-b border-white/5">
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Dynamic Elements</h2>
                            </div>

                            <TagInput
                                label="Typing Words"
                                value={form.typing_words}
                                onChange={(value) => setForm((current) => ({ ...current, typing_words: value }))}
                                placeholder="Type and press Enter"
                                hint="Words that cycle through the typing animation on your home page."
                            />

                            <TagInput
                                label="Tech Badges"
                                value={form.tech_badges}
                                onChange={(value) => setForm((current) => ({ ...current, tech_badges: value }))}
                                placeholder="Add tech like React, Tailwind"
                                hint="Technologies displayed below the hero description."
                            />
                        </div>
                    </div>

                    {/* Call-to-Action Buttons */}
                    <div className="relative group/card">
                        <div className="absolute -inset-0.5 rounded-2xl blur opacity-10 group-hover/card:opacity-20 transition duration-500" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/12 rounded-2xl p-6 space-y-5">
                            <div className="flex items-center justify-between mb-2 pb-3 border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Call-to-Action Buttons</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setForm((current) => ({
                                            ...current,
                                            cta_buttons: [...(current.cta_buttons || []), { label: '', url: '' }],
                                        }))
                                    }}
                                    className="px-3 py-1.5 text-xs bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all flex items-center gap-1.5"
                                >
                                    <span>+</span> Add CTA
                                </button>
                            </div>

                            {form.cta_buttons && form.cta_buttons.length > 0 ? (
                                <div className="space-y-4">
                                    {form.cta_buttons.map((cta, idx) => (
                                        <div key={idx} className="relative group/item p-5 rounded-xl bg-black/20 border border-white/5 space-y-4 hover:border-white/10 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/5 text-[10px] text-gray-400 font-medium">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-medium">Button Link</span>
                                                </div>
                                                {form.cta_buttons.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setForm((current) => ({
                                                                ...current,
                                                                cta_buttons: current.cta_buttons.filter((_, i) => i !== idx),
                                                            }))
                                                        }}
                                                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <InputField
                                                    label="Label"
                                                    value={cta.label}
                                                    onChange={(e) => {
                                                        const newCtaButtons = [...form.cta_buttons]
                                                        newCtaButtons[idx].label = e.target.value
                                                        setForm((current) => ({ ...current, cta_buttons: newCtaButtons }))
                                                    }}
                                                    placeholder="e.g. Projects"
                                                    required
                                                />
                                                <InputField
                                                    label="Target URL"
                                                    value={cta.url}
                                                    onChange={(e) => {
                                                        const newCtaButtons = [...form.cta_buttons]
                                                        newCtaButtons[idx].url = e.target.value
                                                        setForm((current) => ({ ...current, cta_buttons: newCtaButtons }))
                                                    }}
                                                    placeholder="e.g. /#Portofolio"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 rounded-xl bg-black/20 border border-dashed border-white/10 text-center flex flex-col items-center justify-center gap-2">
                                    <p className="text-gray-500 text-sm">No CTA buttons defined.</p>
                                    <p className="text-gray-600 text-xs">Click the + Add CTA button to create one.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Image & Styling */}
                    <div className="relative group/card">
                        <div className="absolute -inset-0.5 rounded-2xl blur opacity-10 group-hover/card:opacity-20 transition duration-500" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/12 rounded-2xl p-6 space-y-5">
                            <div className="flex items-center gap-2 mb-2 pb-3 border-b border-white/5">
                                <Paintbrush className="w-4 h-4 text-indigo-400" />
                                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Visual Settings</h2>
                            </div>

                            <div>
                                <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium mb-2 block">Hero Image</label>
                                <label className="flex items-center gap-4 w-full bg-black/20 border border-dashed border-white/15 rounded-xl px-4 py-6 cursor-pointer hover:border-indigo-500/40 hover:bg-black/40 transition-all">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            className="h-20 w-28 object-cover rounded-lg border border-white/10 shrink-0 shadow-md"
                                            alt="hero preview"
                                        />
                                    ) : (
                                        <div className="w-28 h-20 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                                            <ImageIcon className="w-6 h-6 text-gray-600" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-200 font-medium">{imageFile ? 'Change Image' : 'Click to Upload'}</p>
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP, GIF (recommended: square or wide aspect)</p>
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                            </div>

                            <InputField label="Image Alt Text" value={form.hero_image_alt} onChange={set('hero_image_alt')} placeholder="Developer illustration" hint="For accessibility and SEO" />

                        </div>
                    </div>

                    {/* Save Button: Sleek floating pill */}
                    <div className="fixed z-50 bottom-6 right-6 lg:right-12">
                        <button
                            onClick={handleSave}
                            disabled={uploading}
                            className="relative group flex items-center justify-center focus:outline-none"
                        >
                            <div className="absolute -inset-1 rounded-full opacity-60 blur group-hover:opacity-100 transition duration-300" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
                            <div className="relative flex items-center gap-2 px-6 py-3.5 bg-[#0a0a1a] border border-white/15 rounded-full shadow-2xl transition-all duration-300 group-hover:bg-[#111122]">
                                {uploading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span className="text-sm font-semibold text-white">Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 text-indigo-400" />
                                        <span className="text-sm font-semibold text-white">Save Changes</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Live Preview Section */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6 rounded-2xl border border-white/12 bg-white/5 backdrop-blur-xl p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Live Preview</h2>

                        <div className="rounded-lg overflow-hidden border border-white/10 bg-gradient-to-b from-[#030014] to-[#0a0a1a]">
                            {/* Image Preview */}
                            <div className="aspect-square bg-black/40 flex items-center justify-center overflow-hidden">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-gray-700">
                                        <ImageIcon className="w-12 h-12 mx-auto" />
                                    </div>
                                )}
                            </div>

                            {/* Content Preview */}
                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider">
                                    <Sparkles className="w-3 h-3" /> {form.badge_text || 'Badge'}
                                </div>

                                <h3 className="text-lg font-bold text-white leading-tight">
                                    {form.title_line_1 || 'Title 1'} <br />
                                    <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                        {form.title_line_2 || 'Title 2'}
                                    </span>
                                </h3>

                                <p className="text-xs text-gray-300 line-clamp-2">{form.description || 'Description preview'}</p>

                                <div className="flex flex-wrap gap-1.5 pt-2">
                                    {normalizeList(form.tech_badges).slice(0, 3).map((tech) => (
                                        <span key={tech} className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-300">
                                            {tech}
                                        </span>
                                    ))}
                                    {normalizeList(form.tech_badges).length > 3 && (
                                        <span className="px-2 py-1 text-[10px] text-gray-400">+{normalizeList(form.tech_badges).length - 3}</span>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-2 flex-wrap">
                                    {(form.cta_buttons && form.cta_buttons.length > 0)
                                        ? form.cta_buttons.slice(0, 3).map((cta, idx) => (
                                            <span key={idx} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white">
                                                {cta.label || 'Button'}
                                            </span>
                                        ))
                                        : (
                                            <>
                                                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white">
                                                    Primary
                                                </span>
                                                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white">
                                                    Secondary
                                                </span>
                                            </>
                                        )}
                                    {form.cta_buttons && form.cta_buttons.length > 3 && (
                                        <span className="px-3 py-1.5 text-[10px] text-gray-400">+{form.cta_buttons.length - 3}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="text-[11px] text-gray-400 space-y-1">
                            <p>💡 Changes are automatically reflected on your home page in real-time.</p>
                        </div>
                    </div>
                </div>
            </div>

            <ToastStack toasts={toasts} onDismiss={removeToast} />
        </div>
    )
}
