import { useEffect, useState, memo, useMemo } from "react"
import { FileText, Code, Award, Globe, ArrowUpRight, Sparkles } from "lucide-react"
import AOS from 'aos'
import 'aos/dist/aos.css'
import { supabase } from "../supabase"

const ABOUT_FALLBACK = {
  name: "Asep Sutrisna Suhada Putra",
  description:
    "Saya adalah mahasiswa Teknik Informatika yang berfokus pada pengembangan Front-End. Saya berfokus pada penciptaan pengalaman digital yang menarik dan selalu berupaya memberikan solusi terbaik dalam setiap proyek yang saya kerjakan.",
  quote: "Leveraging AI as a professional tool, not a replacement.",
  photo_url: "/Photo.jpg",
  cv_url: "https://drive.google.com/file/d/14D0m6vlfyBZ3VZB2q66yCtnVf54iTc3E/view?usp=sharing",
}

// No normalizeCvPath needed

const parseSupabaseStorageUrl = (value) => {
  if (!value || typeof value !== 'string') return null

  const match = value.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+?)(?:\?.*)?$/)
  if (!match) return null

  const bucket = match[1]
  const filePath = decodeURIComponent(match[2])

  if (!bucket || !filePath) return null

  return { bucket, filePath }
}

// Memoized Components
const Header = memo(({ name }) => (
  <div className="text-center lg:mb-8 mb-2 px-[5%]">
    <div className="inline-block relative group">
      <h2
        className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text"
        style={{
          backgroundImage: 'linear-gradient(to right, var(--color-button-primary-from), var(--color-button-primary-to))'
        }}
        data-aos="zoom-in-up"
        data-aos-duration="600"
      >
        About Me
      </h2>
    </div>
    <p
      className="mt-2 max-w-2xl mx-auto text-base sm:text-lg flex items-center justify-center gap-2"
      style={{ color: 'var(--color-text-secondary)' }}
      data-aos="zoom-in-up"
      data-aos-duration="800"
    >
      <Sparkles className="w-5 h-5 text-purple-400" />
      Transforming ideas into digital experiences for {name || ABOUT_FALLBACK.name}
      <Sparkles className="w-5 h-5 text-purple-400" />
    </p>
  </div>
));
Header.displayName = 'Header';

const ProfileImage = memo(({ photoUrl }) => (
  <div className="flex justify-end items-center sm:p-12 sm:py-0 sm:pb-0 p-0 py-2 pb-2">
    <div
      className="relative group"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      {/* Optimized gradient backgrounds with reduced complexity for mobile */}
      <div className="absolute -inset-6 opacity-[25%] z-0 hidden sm:block">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 rounded-full blur-2xl animate-spin-slower" />
        <div className="absolute inset-0 bg-gradient-to-l from-fuchsia-500 via-rose-500 to-pink-600 rounded-full blur-2xl animate-pulse-slow opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600 via-cyan-500 to-teal-400 rounded-full blur-2xl animate-float opacity-50" />
      </div>

      <div className="relative">
        <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full overflow-hidden shadow-[0_0_40px_rgba(120,119,198,0.3)] transform transition-all duration-700 group-hover:scale-105">
          <div className="absolute inset-0 border-4 border-white/20 rounded-full z-20 transition-all duration-700 group-hover:border-white/40 group-hover:scale-105" />

          {/* Optimized overlay effects - disabled on mobile */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-10 transition-opacity duration-700 group-hover:opacity-0 hidden sm:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-transparent to-blue-500/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 hidden sm:block" />

          <img
            src={photoUrl || ABOUT_FALLBACK.photo_url}
            alt="Profile"
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = ABOUT_FALLBACK.photo_url
            }}
          />

          {/* Advanced hover effects - desktop only */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 z-20 hidden sm:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/10 to-transparent transform translate-y-full group-hover:-translate-y-full transition-transform duration-1000 delay-100" />
            <div className="absolute inset-0 rounded-full border-8 border-white/10 scale-0 group-hover:scale-100 transition-transform duration-700 animate-pulse-slow" />
          </div>
        </div>
      </div>
    </div>
  </div>
));
ProfileImage.displayName = 'ProfileImage';

const StatCard = memo(({ icon: Icon, value, label, description, animation, href }) => {
  const Wrapper = href ? 'a' : 'div'

  return (
    <Wrapper
      data-aos={animation}
      data-aos-duration={1300}
      className="relative group block h-full"
      href={href}
    >
      <div className="relative z-10 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/15 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/10 hover:border-white/30 h-full flex flex-col justify-between shadow-[0_0_15px_rgba(0,0,0,0.1)]">
        <div className="absolute -z-10 inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300" style={{ background: 'linear-gradient(to bottom right, var(--color-primary-dark), var(--color-primary-light))' }}></div>

        <div className="flex items-center justify-between mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 transition-transform duration-500 group-hover:rotate-12 group-hover:bg-white/20">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <span
            className="text-4xl font-bold text-white"
            data-aos="fade-up-left"
            data-aos-duration="1500"
            data-aos-anchor-placement="top-bottom"
          >
            {value}
          </span>
        </div>

        <div>
          <p
            className="text-sm uppercase tracking-wider mb-2"
            style={{ color: 'var(--color-text-secondary)' }}
            data-aos="fade-up"
            data-aos-duration="800"
            data-aos-anchor-placement="top-bottom"
          >
            {label}
          </p>
          <div className="flex items-center justify-between">
            <p
              className="text-xs"
              style={{ color: 'var(--color-text-muted)' }}
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-anchor-placement="top-bottom"
            >
              {description}
            </p>
            <ArrowUpRight className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </Wrapper>
  )
});
StatCard.displayName = 'StatCard';

const AboutPage = () => {
  const [aboutContent, setAboutContent] = useState(null)

  // Projects & certificates from localStorage
  const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]')
  const storedCertificates = JSON.parse(localStorage.getItem('certificates') || '[]')

  // Work experiences fetched from Supabase (server-driven)
  const [workItems, setWorkItems] = useState([])

  useEffect(() => {
    const fetchWorkExperiences = async () => {
      try {
        const { data, error } = await supabase
          .from('work_experiences')
          .select('*')
        if (error) {
          console.error('Error fetching work_experiences:', error)
          return
        }
        setWorkItems(data || [])
      } catch (err) {
        console.error('Unexpected error fetching work_experiences:', err)
      }
    }

    fetchWorkExperiences()
  }, [])

  // Compute precise years/months and a decimal representation
  const { YearExperienceDecimal, YearExperienceLabel } = useMemo(() => {
    if (!Array.isArray(workItems) || workItems.length === 0) {
      const startDate = new Date('2021-11-06')
      const now = new Date()
      let years = now.getFullYear() - startDate.getFullYear()
      if (now.getMonth() < startDate.getMonth() || (now.getMonth() === startDate.getMonth() && now.getDate() < startDate.getDate())) years -= 1
      const decimal = Number(years.toFixed(1))
      const label = `${years} ${years === 1 ? 'year' : 'years'}`
      return { YearExperienceDecimal: decimal, YearExperienceLabel: label }
    }

    const starts = workItems
      .map((w) => ({ month: Number(w.start_month) || 1, year: Number(w.start_year) || 0 }))
      .filter((s) => s.year > 0)

    const ends = workItems.map((w) => {
      if (w.is_current) {
        const now = new Date()
        return { month: now.getMonth() + 1, year: now.getFullYear() }
      }
      return { month: Number(w.end_month) || 1, year: Number(w.end_year) || (Number(w.start_year) || 0) }
    })

    if (starts.length === 0 || ends.length === 0) {
      return { YearExperienceDecimal: 0, YearExperienceLabel: '0 years' }
    }

    const earliest = starts.reduce((min, cur) => {
      if (cur.year < min.year) return cur
      if (cur.year === min.year && cur.month < min.month) return cur
      return min
    }, starts[0])

    const latest = ends.reduce((max, cur) => {
      if (cur.year > max.year) return cur
      if (cur.year === max.year && cur.month > max.month) return cur
      return max
    }, ends[0])

    const totalMonths = (latest.year - earliest.year) * 12 + (latest.month - earliest.month)
    const years = Math.floor(totalMonths / 12)
    const months = Math.max(0, totalMonths % 12)
    const decimal = Number((totalMonths / 12).toFixed(1))
    const label = months > 0
      ? `${years} ${years === 1 ? 'year' : 'years'} ${months} ${months === 1 ? 'month' : 'months'} (${decimal} yrs)`
      : `${years} ${years === 1 ? 'year' : 'years'} (${decimal} yrs)`

    return { YearExperienceDecimal: decimal, YearExperienceLabel: label }
  }, [workItems])

  const totalProjects = storedProjects.length
  const totalCertificates = storedCertificates.length

  useEffect(() => {
    const fetchAboutContent = async () => {
      const { data, error } = await supabase
        .from("about_contents")
        .select("*")
        .eq("is_published", true)
        .order("version", { ascending: false })
        .limit(1)

      if (error) {
        console.error("Error fetching about content:", error)
        return
      }

      setAboutContent(data?.[0] || null)
    }

    fetchAboutContent()
  }, [])

  const content = aboutContent || ABOUT_FALLBACK

  const handleCvDownload = async (event) => {
    const cvValue = content.cv_url || ABOUT_FALLBACK.cv_url

    if (!cvValue) return

    const storageLocation = parseSupabaseStorageUrl(cvValue)
    if (!storageLocation) return

    event.preventDefault()

    try {
      const { data, error } = await supabase.storage
        .from(storageLocation.bucket)
        .createSignedUrl(storageLocation.filePath, 60)

      if (error || !data?.signedUrl) {
        throw error || new Error('Failed to create CV download URL')
      }

      const response = await fetch(data.signedUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch CV file')
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const fileName = storageLocation.filePath.split('/').pop() || 'cv.pdf'

      const link = document.createElement('a')
      link.href = objectUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()

      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      console.error('Failed to download CV:', error)
      window.open(cvValue, '_blank', 'noopener,noreferrer')
    }
  }

  // Optimized AOS initialization
  useEffect(() => {
    const initAOS = () => {
      AOS.init({
        once: false,
      });
    };

    initAOS();

    // Debounced resize handler
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initAOS, 250);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Memoized stats data
  const statsData = useMemo(() => [
    {
      icon: Code,
      value: totalProjects,
      label: "Total Projects",
      description: "Innovative web solutions crafted",
      animation: "fade-right",
      href: "#Portofolio",
    },
    {
      icon: Award,
      value: totalCertificates,
      label: "Certificates",
      description: "Professional skills validated",
      animation: "fade-up",
      href: "#Portofolio",
    },
    {
      icon: Globe,
      value: YearExperienceDecimal,
      label: "Years of Experience",
      description: YearExperienceLabel || "Continuous learning journey",
      animation: "fade-left",
      href: "#WorkExperience",
    },
  ], [totalProjects, totalCertificates, YearExperienceDecimal, YearExperienceLabel]);

  return (
    <div
      className="h-auto pb-[10%] text-white overflow-hidden px-[5%] sm:px-[5%] lg:px-[10%] mt-10 sm-mt-0"
      id="About"
      itemScope
      itemType="https://schema.org/Person"

    >
      <Header name={content.name} />

      <div className="w-full mx-auto pt-8 sm:pt-12 relative">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold"
              data-aos="fade-right"
              data-aos-duration="1000"
            >
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
                Hello, I&apos;m
              </span>
              <span
                className="block mt-2 text-gray-200"
                data-aos="fade-right"
                data-aos-duration="1300"
                itemProp="name"
              >
                {content.name}
              </span>
            </h2>

            <p
              className="text-base sm:text-lg lg:text-xl leading-relaxed text-justify pb-4 sm:pb-0"
              style={{ color: 'var(--color-text-secondary)' }}
              data-aos="fade-right"
              data-aos-duration="1500"
            >
              {content.description}
            </p>

            {/* Quote Section */}
            <div
              className="relative rounded-2xl p-4 my-6 bg-white/5 backdrop-blur-xl border border-white/15 shadow-2xl overflow-hidden hover:bg-white/10 hover:border-white/30 transition-all duration-300 group"
              data-aos="fade-up"
              data-aos-duration="1700"
            >
              {/* Floating orbs background */}
              <div className="absolute top-2 right-4 w-16 h-16 rounded-full blur-xl" style={{ background: 'linear-gradient(90deg, rgba(var(--color-primary-dark-rgb),0.2), rgba(var(--color-primary-light-rgb),0.2))' }}></div>
              <div className="absolute -bottom-4 -left-2 w-12 h-12 rounded-full blur-lg" style={{ background: 'linear-gradient(90deg, rgba(var(--color-primary-light-rgb),0.2), rgba(var(--color-primary-dark-rgb),0.2))' }}></div>

              {/* Quote icon */}
              <div className="absolute top-3 left-4 opacity-30" style={{ color: 'var(--color-primary-dark)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                </svg>
              </div>

              <blockquote className="text-center lg:text-left italic font-medium text-sm relative z-10 pl-6" style={{ color: 'var(--color-text-secondary)' }}>
                &quot;{content.quote || ABOUT_FALLBACK.quote}&quot;
              </blockquote>
            </div>

            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-4 lg:px-0 w-full">
              <a href={content.cv_url || ABOUT_FALLBACK.cv_url} onClick={handleCvDownload} className="w-full lg:w-auto" target="_blank" rel="noopener noreferrer">
                <button
                  data-aos="fade-up"
                  data-aos-duration="800"
                  className="w-full lg:w-auto sm:px-6 py-2 sm:py-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-medium transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:border-white/40 flex items-center justify-center lg:justify-start gap-2 shadow-lg hover:shadow-xl"
                >
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> Download CV
                </button>
              </a>
              <a href="#Portofolio" className="w-full lg:w-auto">
                <button
                  data-aos="fade-up"
                  data-aos-duration="1000"
                  className="w-full lg:w-auto sm:px-6 py-2 sm:py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/15 text-gray-300 font-medium transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:border-white/30 hover:text-white flex items-center justify-center lg:justify-start gap-2 shadow-lg hover:shadow-xl group"
                >
                  <Code className="w-4 h-4 sm:w-5 sm:h-5" /> View Projects
                </button>
              </a>
            </div>
          </div>

          <ProfileImage photoUrl={content.photo_url} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {statsData.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin-slower {
          to { transform: rotate(360deg); }
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        .animate-pulse-slow {
          animation: pulse 3s infinite;
        }
        .animate-spin-slower {
          animation: spin-slower 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

AboutPage.displayName = 'AboutPage';
export default memo(AboutPage);