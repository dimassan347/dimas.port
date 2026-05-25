import { useState, useEffect, useCallback, memo, useMemo } from "react"
import { Helmet } from "react-helmet-async"
import { Github, Linkedin, Mail, ExternalLink, Instagram, Sparkles } from "lucide-react"
import AOS from 'aos'
import 'aos/dist/aos.css'
import { supabase } from '../supabase'

const TechStack = memo(({ tech }) => (
  <div className="px-4 py-2 hidden sm:flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all shadow-lg hover:shadow-indigo-500/10">
    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
    {tech}
  </div>
));
TechStack.displayName = 'TechStack';

const CTAButton = memo(({ href, text, icon: Icon }) => (
  <a href={href}>
    <button className="group relative w-[160px]">
      <div className="absolute -inset-0.5 rounded-xl opacity-40 blur-lg group-hover:opacity-80 transition-all duration-500" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }}></div>
      <div className="relative h-11 bg-white/5 backdrop-blur-xl rounded-xl border border-white/15 leading-none overflow-hidden hover:bg-white/10 hover:border-white/30 transition-all duration-300 shadow-xl">
        <div className="absolute inset-0 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" style={{ background: 'linear-gradient(90deg, rgba(var(--color-primary-dark-rgb),0.15), rgba(var(--color-primary-light-rgb),0.15))' }}></div>
        <span className="absolute inset-0 flex items-center justify-center gap-2 text-sm group-hover:gap-3 transition-all duration-300">
          <span className="text-white font-medium z-10">
            {text}
          </span>
          <Icon className={`w-4 h-4 text-indigo-300 ${text === 'Contact' ? 'group-hover:translate-x-1' : 'group-hover:rotate-45'} transform transition-all duration-300 z-10`} />
        </span>
      </div>
    </button>
  </a>
));
CTAButton.displayName = 'CTAButton';

const SocialLink = memo(({ icon: Icon, link, label }) => (
  <a href={link} target="_blank" rel="noopener noreferrer" aria-label={label}>
    <button className="group relative p-3"
      aria-label={label}>
      <div className="absolute -inset-0.5 rounded-xl blur opacity-20 group-hover:opacity-60 transition duration-300" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }}></div>
      <div className="relative rounded-xl bg-white/5 backdrop-blur-xl p-3 flex items-center justify-center border border-white/15 group-hover:border-white/30 group-hover:bg-white/10 transition-all duration-300 shadow-xl group-hover:scale-110">
        <Icon className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
      </div>
    </button>
  </a>
));
SocialLink.displayName = 'SocialLink';

const TYPING_SPEED = 100;
const ERASING_SPEED = 50;
const PAUSE_DURATION = 2000;
const FALLBACK_SITE_ORIGIN = typeof window !== 'undefined' ? window.location.origin : ''

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.filter(Boolean)
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean)
    }
  }
  return []
}

const normalizeCtaButtons = (value) => normalizeArray(value)
  .map((button) => {
    if (!button || typeof button !== 'object') return null

    const label = button.label?.trim?.() || ''
    const url = button.url?.trim?.() || ''
    if (!label || !url) return null

    return { label, url }
  })
  .filter(Boolean)

const buildPageTitle = (heroData) => {
  const titleParts = [heroData?.title_line_1, heroData?.title_line_2]
    .map((part) => part?.trim())
    .filter(Boolean)

  return titleParts.join(' ').trim()
}

const useFetchSocialLinks = () => {
  const [state, setState] = useState({ links: [], loading: true })

  useEffect(() => {
    let mounted = true
    const fetchLinks = async () => {
      setState((current) => ({ ...current, loading: true }))
      try {
        const { data, error } = await supabase
          .from('social_links')
          .select('*')
          .eq('is_active', true)
          .order('is_primary', { ascending: false })
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true });

        if (!mounted) return

        if (!error && Array.isArray(data)) {
          const mapped = data.map((item) => {
            const key = (item.icon || item.platform || item.name || '').toString().toLowerCase()
            let Icon = ExternalLink
            if (key.includes('git') || key.includes('github')) Icon = Github
            else if (key.includes('link') || key.includes('linkedin')) Icon = Linkedin
            else if (key.includes('insta') || key.includes('instagram')) Icon = Instagram
            else if (key.includes('youtube')) Icon = ExternalLink

            return {
              icon: Icon,
              link: item.url || item.link || '#',
              label: item.display_name || item.displayName || item.platform || item.name || 'Social'
            }
          })

          setState({ links: mapped, loading: false })
        } else {
          setState({ links: [], loading: false })
        }
      } catch (err) {
        if (mounted) {
          console.error('Failed to fetch social links for hero:', err)
          setState({ links: [], loading: false })
        }
      }
    }

    fetchLinks()
    return () => { mounted = false }
  }, [])

  return state
}

const Home = () => {
  const [text, setText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [heroData, setHeroData] = useState(null)
  const [heroLoading, setHeroLoading] = useState(true)
  const [siteOrigin, setSiteOrigin] = useState(FALLBACK_SITE_ORIGIN)

  const { links: socialLinks, loading: socialLoading } = useFetchSocialLinks()

  const pageTitle = useMemo(() => buildPageTitle(heroData), [heroData])
  const pageDescription = useMemo(() => heroData?.description?.trim() || '', [heroData])
  const heroImageAlt = useMemo(() => {
    if (!heroData) return ''
    return heroData.hero_image_alt?.trim() || `${buildPageTitle(heroData)} illustration`.trim()
  }, [heroData])
  const canonicalUrl = useMemo(() => (siteOrigin ? `${siteOrigin}/` : ''), [siteOrigin])
  const structuredData = useMemo(() => {
    if (!heroData) return null

    return {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": pageTitle || undefined,
      "jobTitle": heroData.title_line_2 || pageTitle || '',
      "url": canonicalUrl || undefined,
      "sameAs": socialLinks.map((social) => social.link).filter((link) => Boolean(link) && link !== '#')
    }
  }, [canonicalUrl, heroData, pageTitle, socialLinks])

  // Fetch hero content from database
  useEffect(() => {
    const fetchHeroContent = async () => {
      setHeroLoading(true)
      try {
        const { data, error } = await supabase
          .from('hero_contents')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle()

        if (!error && data) {
          setHeroData({
            badge_text: data.badge_text?.trim() || '',
            title_line_1: data.title_line_1?.trim() || '',
            title_line_2: data.title_line_2?.trim() || '',
            typing_words: normalizeArray(data.typing_words),
            description: data.description?.trim() || '',
            tech_badges: normalizeArray(data.tech_badges),
            cta_buttons: normalizeCtaButtons(data.cta_buttons),
            hero_image_url: data.hero_image_url?.trim() || '',
            hero_image_alt: data.hero_image_alt?.trim() || '',
            accent_from: data.accent_from?.trim() || '',
            accent_to: data.accent_to?.trim() || '',
          })
        } else {
          setHeroData(null)
        }
      } catch (error) {
        console.error('Error fetching hero content:', error)
        setHeroData(null)
      } finally {
        setHeroLoading(false)
      }
    }

    fetchHeroContent()

    const subscription = supabase
      .channel('hero_content_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hero_contents',
        },
        () => {
          fetchHeroContent()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSiteOrigin(window.location.origin)
    }
  }, [])

  useEffect(() => {
    const initAOS = () => {
      AOS.init({
        once: true,
        offset: 10,
      });
    };

    initAOS();
    window.addEventListener('resize', initAOS);
    return () => window.removeEventListener('resize', initAOS);
  }, []);

  useEffect(() => {
    setIsLoaded(true);
    return () => setIsLoaded(false);
  }, []);

  useEffect(() => {
    setText('')
    setWordIndex(0)
    setCharIndex(0)
    setIsTyping(true)
  }, [heroData])

  const handleTyping = useCallback(() => {
    const typingWords = heroData?.typing_words || []
    if (!typingWords.length) return

    const currentWord = typingWords[wordIndex % typingWords.length] || ''

    if (isTyping) {
      if (charIndex < currentWord.length) {
        setText(prev => prev + currentWord[charIndex]);
        setCharIndex(prev => prev + 1);
      } else {
        setTimeout(() => setIsTyping(false), PAUSE_DURATION);
      }
    } else {
      if (charIndex > 0) {
        setText(prev => prev.slice(0, -1));
        setCharIndex(prev => prev - 1);
      } else {
        setWordIndex(prev => (prev + 1) % typingWords.length);
        setIsTyping(true);
      }
    }
  }, [charIndex, isTyping, wordIndex, heroData]);

  useEffect(() => {
    if (!heroData?.typing_words?.length) return

    const timeout = setTimeout(
      handleTyping,
      isTyping ? TYPING_SPEED : ERASING_SPEED
    );
    return () => clearTimeout(timeout);
  }, [handleTyping, heroData, isTyping]);

  if (heroLoading || socialLoading || !heroData) {
    if (!heroLoading && !socialLoading && !heroData) {
      return <div className="min-h-screen" style={{ backgroundColor: 'var(--color-backdrop-base)' }} />
    }

    return (
      <div className="min-h-screen flex items-center justify-center px-[5%]" style={{ backgroundColor: 'var(--color-backdrop-base)' }}>
        <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-indigo-500 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>asutrisnadev</title>
        {pageDescription && <meta name="description" content={pageDescription} />}
        <meta name="robots" content="index, follow" />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        {pageTitle && <meta property="og:title" content={pageTitle} />}
        {pageDescription && <meta property="og:description" content={pageDescription} />}
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        <meta property="og:type" content="website" />
        {structuredData && <script type="application/ld+json">{JSON.stringify(structuredData)}</script>}
      </Helmet>

      <div className="min-h-screen overflow-hidden px-[5%] sm:px-[5%] lg:px-[10%]" id="Hero" style={{ backgroundColor: 'var(--color-backdrop-base)' }}>
        <div className={`relative z-10 transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
          <div className="container mx-auto min-h-screen">
            <div className="flex flex-col lg:flex-row items-center justify-center h-screen md:justify-between gap-0 sm:gap-12 lg:gap-20">
              {/* Left Column */}
              <div className="w-full lg:w-1/2 space-y-6 sm:space-y-8 text-left lg:text-left order-1 lg:order-1 lg:mt-0"
                data-aos="fade-right"
                data-aos-delay="200">
                <div className="space-y-4 sm:space-y-6">
                  {/* Status Badge - Dynamic */}
                  <div className="inline-block animate-float lg:mx-0" data-aos="zoom-in" data-aos-delay="400">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }}></div>
                      <div className="relative px-4 sm:px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/15 shadow-xl hover:bg-white/10 transition-all">
                        <span className="text-transparent bg-clip-text sm:text-sm text-xs font-semibold flex items-center" style={{ backgroundImage: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
                          <Sparkles className="sm:w-4 sm:h-4 w-3.5 h-3.5 mr-2 text-indigo-400" />
                          {heroData.badge_text}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main Title - Dynamic */}
                  <div className="space-y-2" data-aos="fade-up" data-aos-delay="600">
                    <h1 className="text-5xl sm:text-6xl md:text-6xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
                      <span className="relative inline-block">
                        <span className="absolute -inset-2 blur-2xl opacity-20" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }}></span>
                        <span className="relative bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, var(--color-text-primary), var(--color-text-secondary))', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
                          {heroData.title_line_1}
                        </span>
                      </span>
                      <br />
                      <span className="relative inline-block mt-2">
                        <span className="absolute -inset-2 blur-2xl opacity-20" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }}></span>
                        <span className="relative bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
                          {heroData.title_line_2}
                        </span>
                      </span>
                    </h1>
                  </div>

                  {/* Typing Effect */}
                  <div className="h-8 flex items-center" data-aos="fade-up" data-aos-delay="800">
                    <span className="text-xl md:text-2xl bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent font-light">
                      {text}
                    </span>
                    <span className="w-[3px] h-6 ml-1 animate-blink" style={{ background: 'linear-gradient(180deg, var(--color-primary-dark), var(--color-primary-light))' }}></span>
                  </div>

                  {/* Description */}
                  <p className="text-base md:text-lg max-w-xl leading-relaxed font-light"
                    style={{ color: 'var(--color-text-secondary)' }}
                    data-aos="fade-up"
                    data-aos-delay="1000">
                    {heroData.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-3 justify-start" data-aos="fade-up" data-aos-delay="1200">
                    {heroData.tech_badges.map((tech, index) => (
                      <TechStack key={index} tech={tech} />
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-3 w-full justify-center sm:justify-start" data-aos="fade-up" data-aos-delay="1400">
                    {Array.isArray(heroData.cta_buttons) && heroData.cta_buttons.map((btn, index) => (
                      <div key={index} className={`${index >= 2 ? 'hidden sm:inline-block' : 'block sm:inline-block'}`}>
                        <CTAButton
                          href={btn.url}
                          text={btn.label}
                          icon={btn.label === 'Contact' ? Mail : ExternalLink}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Social Links */}
                  <div className="hidden sm:flex gap-4 justify-start" data-aos="fade-up" data-aos-delay="1600">
                    {socialLinks.map((social, index) => (
                      <SocialLink key={index} {...social} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - WebM Video */}
              <div className="w-full py-0 md:py-[10%] sm:py-0 lg:w-1/2 h-[260px] sm:h-[400px] lg:h-[600px] xl:h-[750px] relative flex items-center justify-center order-2 lg:order-2  mt-5 sm:mt-0"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                data-aos="fade-left"
                data-aos-delay="600">
                <div className="relative w-full opacity-90">
                  <div className={`absolute inset-0 bg-gradient-to-r from-[color:${heroData.accent_from}]/10 to-[color:${heroData.accent_to}]/10 rounded-3xl blur-3xl transition-all duration-700 ease-in-out ${isHovering ? "opacity-50 scale-105" : "opacity-20 scale-100"
                    }`} style={{ backgroundImage: `linear-gradient(to right, ${heroData.accent_from}1a, ${heroData.accent_to}1a)` }}>
                  </div>

                  <div className={`relative lg:left-12 z-10 w-full opacity-90 transform transition-transform duration-500 ${isHovering ? "scale-105" : "scale-100"
                    }`}>
                    {heroData.hero_image_url ? (
                      <img
                        src={heroData.hero_image_url}
                        alt={heroImageAlt}
                        className={`w-full h-full object-contain transition-all duration-500 ${isHovering
                          ? "scale-[95%] sm:scale-[90%] md:scale-[90%] lg:scale-[90%] rotate-2"
                          : "scale-[90%] sm:scale-[80%] md:scale-[80%] lg:scale-[80%]"
                          }`}
                      />
                    ) : null}
                  </div>

                  <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ${isHovering ? "opacity-50" : "opacity-20"
                    }`}>
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] blur-3xl animate-[pulse_6s_cubic-bezier(0.4,0,0.6,1)_infinite] transition-all duration-700 ${isHovering ? "scale-110" : "scale-100"
                      }`} style={{ background: `linear-gradient(to bottom right, ${heroData.accent_from}19, ${heroData.accent_to}19)` }}>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

Home.displayName = 'Home';
export default memo(Home);