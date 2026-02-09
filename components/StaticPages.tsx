import React from 'react';
import { Button } from './Button';
import { Check, Zap, LayoutTemplate, ShieldCheck } from 'lucide-react';

// --- Landing Page ---
export const LandingPage = ({ onStart, onLogin }: { onStart: () => void; onLogin: () => void }) => (
  <div className="relative flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-in fade-in duration-700">
    <div className="absolute top-0 right-0 p-4">
      <Button variant="ghost" onClick={onLogin}>Log in</Button>
    </div>
    <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-nordic-accent to-emerald-600 bg-clip-text text-transparent tracking-tight">
      Nordic Studio
    </h1>
    <p className="text-xl text-nordic-muted dark:text-nordic-darkMuted max-w-2xl mb-10 leading-relaxed">
      Lag produktbilder i studiokvalitet med kunstig intelligens. 
      Skreddersydd for ren, nordisk estetikk.
    </p>
    <div className="flex gap-4">
        <Button size="lg" onClick={onStart} className="shadow-lg shadow-nordic-accent/20">
        Kom i gang gratis
        </Button>
    </div>
    
    {/* Social Proof / Trust Badges kan legges her */}
    <div className="mt-20 opacity-50 grayscale flex gap-8">
        {/* Placeholder logoer */}
        <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
);

// --- Pricing Page ---
export const PricingPage = ({ onSelectPlan, onLogin }: { onSelectPlan: (plan: 'starter' | 'pro') => void; onLogin: () => void }) => (
   <div className="py-20 px-4 max-w-5xl mx-auto">
     <div className="text-center mb-16">
        <h2 className="text-4xl font-bold tracking-tight mb-4 text-nordic-text dark:text-white">Enkel prising</h2>
        <p className="text-lg text-nordic-muted max-w-2xl mx-auto">Ingen skjulte kostnader. Start gratis og oppgrader når du skalerer.</p>
     </div>
     <div className="grid md:grid-cols-2 gap-8 items-stretch mb-12">
       {/* Starter */}
       <div className="p-10 rounded-3xl border border-nordic-border dark:border-nordic-darkBorder bg-white dark:bg-nordic-darkSurface shadow-card flex flex-col justify-between">
         <div>
            <h3 className="text-2xl font-bold mb-2 text-nordic-text dark:text-white">Starter</h3>
            <p className="text-4xl font-bold mb-8">Gratis</p>
            <ul className="space-y-4 mb-8 text-nordic-muted dark:text-nordic-darkMuted">
                <li className="flex items-center"><Check className="w-5 h-5 mr-3 text-emerald-500"/> 3 daglige genereringer</li>
                <li className="flex items-center"><Check className="w-5 h-5 mr-3 text-emerald-500"/> Standard oppløsning (1K)</li>
                <li className="flex items-center"><Check className="w-5 h-5 mr-3 text-emerald-500"/> Tilgang til basis-maler</li>
            </ul>
         </div>
         <Button variant="outline" className="w-full" size="lg" onClick={() => onSelectPlan('starter')}>Velg Starter</Button>
       </div>
       {/* Pro */}
       <div className="p-10 rounded-3xl border-2 border-nordic-accent dark:border-nordic-darkAccent bg-white dark:bg-nordic-darkSurface relative shadow-2xl shadow-nordic-accent/10 flex flex-col justify-between transform scale-105">
         <div className="absolute top-0 right-0 bg-nordic-accent text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">Mest Populær</div>
         <div>
             <h3 className="text-2xl font-bold mb-2 text-nordic-text dark:text-white">Pro</h3>
             <p className="text-4xl font-bold mb-8">199 kr <span className="text-base font-normal text-nordic-muted">/mnd</span></p>
             <ul className="space-y-4 mb-8 text-nordic-muted dark:text-nordic-darkMuted">
                <li className="flex items-center"><Check className="w-5 h-5 mr-3 text-emerald-500"/> Ubegrenset generering</li>
                <li className="flex items-center"><Check className="w-5 h-5 mr-3 text-emerald-500"/> 4K Ultra-HD oppløsning</li>
                <li className="flex items-center"><Check className="w-5 h-5 mr-3 text-emerald-500"/> Kommersiell lisens</li>
                <li className="flex items-center"><Check className="w-5 h-5 mr-3 text-emerald-500"/> Prioritert support</li>
             </ul>
         </div>
         <Button variant="primary" className="w-full" size="lg" onClick={() => onSelectPlan('pro')}>Oppgrader til Pro</Button>
       </div>
     </div>
     <div className="text-center">
        <p className="text-nordic-muted dark:text-nordic-darkMuted">
          Har du allerede en konto?{' '}
          <button 
            onClick={onLogin}
            className="text-nordic-accent font-semibold hover:underline"
          >
            Logg inn her
          </button>
        </p>
     </div>
   </div>
);

// --- Features Page ---
export const FeaturesPage = () => (
  <div className="py-24 max-w-7xl mx-auto px-6">
    <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-nordic-text dark:text-white">Hvorfor velge Nordic Studio?</h2>
        <p className="text-xl text-nordic-muted max-w-3xl mx-auto">Vi kombinerer avansert AI med tidløs skandinavisk designfilosofi.</p>
    </div>
    <div className="grid md:grid-cols-3 gap-12">
       <div className="bg-white dark:bg-nordic-darkSurface p-8 rounded-2xl shadow-card hover:shadow-lg transition-shadow border border-nordic-border dark:border-nordic-darkBorder">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-nordic-text dark:text-white">Lynrask Generering</h3>
          <p className="text-nordic-muted dark:text-nordic-darkMuted leading-relaxed">
            Få profesjonelle resultater på sekunder med vår optimaliserte Gemini 3-motor. Ingen ventetid, ingen kompliserte prompts.
          </p>
       </div>
       <div className="bg-white dark:bg-nordic-darkSurface p-8 rounded-2xl shadow-card hover:shadow-lg transition-shadow border border-nordic-border dark:border-nordic-darkBorder">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
            <LayoutTemplate className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-nordic-text dark:text-white">Nordiske Maler</h3>
          <p className="text-nordic-muted dark:text-nordic-darkMuted leading-relaxed">
            Eksklusive scener designet for det skandinaviske markedet. Minimalisme, naturlig lys og organiske materialer.
          </p>
       </div>
       <div className="bg-white dark:bg-nordic-darkSurface p-8 rounded-2xl shadow-card hover:shadow-lg transition-shadow border border-nordic-border dark:border-nordic-darkBorder">
          <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-nordic-text dark:text-white">Kommersiell Bruk</h3>
          <p className="text-nordic-muted dark:text-nordic-darkMuted leading-relaxed">
            Alle bilder du genererer er dine og kan brukes fritt i markedsføring, sosiale medier og nettbutikk uten begrensninger.
          </p>
       </div>
    </div>
  </div>
);

// --- Simple Placeholders ---
export const ResourcesPage = () => (
    <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Ressurser</h1>
        <p className="text-xl text-nordic-muted">Vi jobber med å lage guider og tutorials. Kommer snart!</p>
    </div>
);

export const LegalPage = ({ title }: { title: string }) => (
    <div className="max-w-3xl mx-auto py-20 px-6 prose dark:prose-invert">
        <h1 className="text-4xl font-bold mb-8">{title}</h1>
        <p>Her kommer den juridiske teksten for {title}.</p>
        <p className="text-sm text-nordic-muted mt-8">Sist oppdatert: {new Date().toLocaleDateString()}</p>
    </div>
);

// --- Contact Page ---
export const ContactPage = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Meldingen din er sendt! Vi kontakter deg snart.");
    };

    return (
        <div className="max-w-xl mx-auto py-20 px-6">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Kontakt oss</h1>
                <p className="text-nordic-muted">Har du spørsmål eller trenger hjelp? Send oss en melding.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-nordic-darkSurface p-8 rounded-2xl border border-nordic-border dark:border-nordic-darkBorder shadow-card">
                <div>
                    <label className="block text-sm font-medium mb-2">Navn</label>
                    <input 
                        type="text" 
                        required 
                        className="w-full px-4 py-2 rounded-lg border border-nordic-border dark:border-nordic-darkBorder bg-nordic-bg dark:bg-nordic-darkClay"
                        placeholder="Ditt navn"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">E-post</label>
                    <input 
                        type="email" 
                        required 
                        className="w-full px-4 py-2 rounded-lg border border-nordic-border dark:border-nordic-darkBorder bg-nordic-bg dark:bg-nordic-darkClay"
                        placeholder="din@epost.no"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Melding</label>
                    <textarea 
                        required 
                        rows={5}
                        className="w-full px-4 py-2 rounded-lg border border-nordic-border dark:border-nordic-darkBorder bg-nordic-bg dark:bg-nordic-darkClay"
                        placeholder="Hva kan vi hjelpe deg med?"
                    ></textarea>
                </div>
                <Button type="submit" className="w-full">Send melding</Button>
            </form>
        </div>
    );
};