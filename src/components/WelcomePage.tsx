import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Icons } from '../constants/icons';

interface WelcomePageProps {
  onGetStarted: () => void;
}

function WelcomePage({ onGetStarted }: WelcomePageProps): JSX.Element {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-y-auto">
      {/* Header with Language & Theme */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-secondary)]/95 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
              <Icons.Cube className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="font-bold text-lg md:text-2xl tracking-tight">{t.welcome.title}</span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            {/* Language Selector */}
            <div className="flex gap-0.5 md:gap-1 bg-[var(--bg-tertiary)] rounded-md md:rounded-lg p-0.5 md:p-1 border border-[var(--border-color)]">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded text-xs font-medium transition-all ${
                  language === 'en'
                    ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded text-xs font-medium transition-all ${
                  language === 'fr'
                    ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                FR
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 md:p-2 hover:bg-[var(--bg-tertiary)] rounded-md md:rounded-lg transition-colors border border-[var(--border-color)]"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              <div className={theme === 'dark' ? 'theme-icon-sun' : 'theme-icon-moon'}>
                {theme === 'dark' ? <Icons.Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Icons.Moon className="w-4 h-4 md:w-5 md:h-5" />}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Text content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-full mb-6 md:mb-8">
                <Icons.Lightning className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm font-medium">{t.welcome.tagline}</span>
              </div>
              
              <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 tracking-tight">
                {t.welcome.title}
              </h1>
              
              <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-[var(--text-secondary)] mb-3 md:mb-4">
                {t.welcome.subtitle}
              </p>
              
              <p className="text-base md:text-xl text-[var(--text-tertiary)] mb-8 md:mb-12 max-w-2xl mx-auto lg:mx-0">
                {t.welcome.description}
              </p>

              <button
                onClick={onGetStarted}
                className="px-6 md:px-8 py-3 md:py-4 bg-[var(--accent)] text-[var(--bg-primary)] hover:opacity-90 rounded-xl font-semibold text-base md:text-lg transition-all duration-200 shadow-2xl hover:scale-105 inline-flex items-center gap-2 md:gap-3"
              >
                {t.welcome.getStarted}
                <Icons.ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Right: Illustration */}
            <div className="relative hidden lg:block">
              <div className="aspect-[4/3] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8 relative overflow-hidden">
                <Icons.HeroIllustration className="w-full h-full text-[var(--text-primary)]" />
                <div className="absolute top-4 right-4 px-3 py-1 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg text-xs font-mono">
                  ISO 9001
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">{t.welcome.useCases.title}</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Product Designer */}
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-[var(--accent)] transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4">
                <Icons.Pencil className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-2">{t.welcome.useCases.productDesigner.title}</h3>
              <p className="text-xs md:text-sm text-[var(--text-secondary)]">{t.welcome.useCases.productDesigner.desc}</p>
            </div>

            {/* Electronics */}
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-[var(--accent)] transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4">
                <Icons.Chip className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-2">{t.welcome.useCases.electronics.title}</h3>
              <p className="text-xs md:text-sm text-[var(--text-secondary)]">{t.welcome.useCases.electronics.desc}</p>
            </div>

            {/* Engineer */}
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-[var(--accent)] transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4">
                <Icons.Cog className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-2">{t.welcome.useCases.engineer.title}</h3>
              <p className="text-xs md:text-sm text-[var(--text-secondary)]">{t.welcome.useCases.engineer.desc}</p>
            </div>

            {/* Maker */}
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-[var(--accent)] transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4">
                <Icons.Tool className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-2">{t.welcome.useCases.maker.title}</h3>
              <p className="text-xs md:text-sm text-[var(--text-secondary)]">{t.welcome.useCases.maker.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">{t.welcome.features.title}</h2>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {/* Precision */}
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-xl">
                <Icons.Ruler className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">{t.welcome.features.precision.title}</h3>
              <p className="text-sm md:text-base text-[var(--text-secondary)] px-2">{t.welcome.features.precision.desc}</p>
            </div>

            {/* AI */}
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-xl">
                <Icons.Robot className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">{t.welcome.features.ai.title}</h3>
              <p className="text-sm md:text-base text-[var(--text-secondary)] px-2">{t.welcome.features.ai.desc}</p>
            </div>

            {/* Export */}
            <div className="text-center sm:col-span-2 md:col-span-1">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-xl">
                <Icons.Download className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">{t.welcome.features.export.title}</h3>
              <p className="text-sm md:text-base text-[var(--text-secondary)] px-2">{t.welcome.features.export.desc}</p>
            </div>
          </div>

          {/* Workflow visualization */}
          <div className="mt-12 md:mt-16 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center">
                <div className="w-12 h-12 bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icons.Chat className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold">{language === 'fr' ? 'Décrivez' : 'Describe'}</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  {language === 'fr' ? 'En langage naturel' : 'In natural language'}
                </p>
              </div>

              <Icons.ChevronRight className="w-6 h-6 text-[var(--text-tertiary)] rotate-90 md:rotate-0" />

              <div className="flex-1 text-center">
                <div className="w-12 h-12 bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icons.Robot className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold">{language === 'fr' ? 'Générez' : 'Generate'}</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  {language === 'fr' ? 'Code paramétrique' : 'Parametric code'}
                </p>
              </div>

              <Icons.ChevronRight className="w-6 h-6 text-[var(--text-tertiary)] rotate-90 md:rotate-0" />

              <div className="flex-1 text-center">
                <div className="w-12 h-12 bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icons.Sliders className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold">{language === 'fr' ? 'Ajustez' : 'Adjust'}</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  {language === 'fr' ? 'Paramètres en temps réel' : 'Real-time parameters'}
                </p>
              </div>

              <Icons.ChevronRight className="w-6 h-6 text-[var(--text-tertiary)] rotate-90 md:rotate-0" />

              <div className="flex-1 text-center">
                <div className="w-12 h-12 bg-[var(--accent)] text-[var(--bg-primary)] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icons.Download className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold">{language === 'fr' ? 'Exportez' : 'Export'}</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  {language === 'fr' ? 'Prêt à imprimer' : 'Ready to print'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">{t.welcome.examples.title}</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Screw */}
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-4 hover:border-[var(--accent)] transition-all duration-300 hover:scale-105">
              <div className="aspect-square mb-3 flex items-center justify-center">
                <Icons.ScrewIllustration className="w-full h-full text-[var(--text-primary)]" />
              </div>
              <div className="flex items-center gap-2">
                <Icons.Check className="text-[var(--accent)] flex-shrink-0 w-4 h-4" />
                <span className="font-mono text-xs md:text-sm">{t.welcome.examples.screw}</span>
              </div>
            </div>

            {/* Enclosure */}
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-4 hover:border-[var(--accent)] transition-all duration-300 hover:scale-105">
              <div className="aspect-square mb-3 flex items-center justify-center">
                <Icons.BoxIllustration className="w-full h-full text-[var(--text-primary)]" />
              </div>
              <div className="flex items-center gap-2">
                <Icons.Check className="text-[var(--accent)] flex-shrink-0 w-4 h-4" />
                <span className="font-mono text-xs md:text-sm">{t.welcome.examples.enclosure}</span>
              </div>
            </div>

            {/* Mount */}
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-4 hover:border-[var(--accent)] transition-all duration-300 hover:scale-105">
              <div className="aspect-square mb-3 flex items-center justify-center">
                <Icons.GearIllustration className="w-full h-full text-[var(--text-primary)]" />
              </div>
              <div className="flex items-center gap-2">
                <Icons.Check className="text-[var(--accent)] flex-shrink-0 w-4 h-4" />
                <span className="font-mono text-xs md:text-sm">{t.welcome.examples.mount}</span>
              </div>
            </div>

            {/* Connector */}
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-4 hover:border-[var(--accent)] transition-all duration-300 hover:scale-105">
              <div className="aspect-square mb-3 flex items-center justify-center">
                <Icons.Cylinder className="w-24 h-24 text-[var(--text-primary)]" />
              </div>
              <div className="flex items-center gap-2">
                <Icons.Check className="text-[var(--accent)] flex-shrink-0 w-4 h-4" />
                <span className="font-mono text-xs md:text-sm">{t.welcome.examples.connector}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="hero-title text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 px-4">
            {language === 'fr' ? 'PRÊT À CRÉER VOS PIÈCES TECHNIQUES ?' : 'READY TO CREATE YOUR TECHNICAL PARTS?'}
          </h2>
          <p className="text-base md:text-xl text-[var(--text-secondary)] mb-6 md:mb-8">
            {language === 'fr' 
              ? 'Commencez gratuitement avec MORPHOS' 
              : 'Start for free with MORPHOS'}
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 md:px-10 py-4 md:py-5 bg-[var(--accent)] text-[var(--bg-primary)] hover:opacity-90 rounded-xl font-bold text-lg md:text-xl transition-all duration-200 shadow-2xl hover:scale-105 inline-flex items-center gap-2 md:gap-3"
          >
            {t.welcome.getStarted}
            <Icons.ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 md:py-8 px-4 md:px-6 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto text-center text-xs md:text-sm text-[var(--text-tertiary)]">
          <p>© 2026 {t.welcome.title} - {language === 'fr' ? 'Générateur de Pièces 3D Paramétriques' : 'Parametric 3D Parts Generator'}</p>
        </div>
      </footer>
    </div>
  );
}

export default WelcomePage;
