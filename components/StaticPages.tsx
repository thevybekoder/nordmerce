import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { 
  Check, 
  Zap, 
  LayoutTemplate, 
  ShieldCheck, 
  MoveHorizontal, 
  Camera, 
  Upload, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

const SHOWCASE_IMAGES = [
  {
    id: 1,
    before: '/images/bottle_before.JPG',
    after: '/images/bottle_after.png',
    label: 'Studio Minimal'
  },
  {
    id: 2,
    before: '/images/lamp_before.JPG',
    after: '/images/lamp_after.png',
    label: 'Warm Interior'
  },
  {
    id: 3,
    before: '/images/headphones_before.JPG',
    after: '/images/headphones_after.png',
    label: 'Lifestyle Dark'
  }
];

const BeforeAfterSlider = ({ before, after, label }: { before: string, after: string, label: string }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const { left, width } = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const pos = ((clientX - left) / width) * 100;
    setSliderPosition(Math.min(100, Math.max(0, pos)));
  };

  const startDragging = () => setIsDragging(true);
  const stopDragging = () => setIsDragging(false);

  return (
    <div 
      className="group relative w-full aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden cursor-ew-resize shadow-card hover:shadow-lg transition-shadow border border-nordic-border dark:border-nordic-darkBorder select-none touch-none"
      ref={containerRef}
      onMouseDown={startDragging}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
      onMouseMove={handleMove}
      onTouchStart={startDragging}
      onTouchEnd={stopDragging}
      onTouchMove={handleMove}
    >
      {/* Background (Before Image) - Always visible as base */}
      <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      
      {/* Before Label - Always on the left */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none transition-opacity duration-300" style={{ opacity: sliderPosition > 20 ? 1 : 0 }}>
        <span className="bg-black/60 text-white text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded shadow-sm">Before</span>
      </div>

      {/* Foreground (After Image) - Revealed by slider */}
      <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}>
        <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      </div>

      {/* After Label - Always on the right */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none transition-opacity duration-300" style={{ opacity: sliderPosition < 80 ? 1 : 0 }}>
        <span className="bg-nordic-accent text-white text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded shadow-sm">After</span>
      </div>

      {/* Slider Handle Line & Circle */}
      <div className="absolute inset-y-0 w-1 bg-white/30 backdrop-blur-sm z-20 pointer-events-none" style={{ left: `${sliderPosition}%` }}>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-nordic-accent border-2 border-white transition-transform ${isDragging ? 'scale-110' : 'scale-100 group-hover:scale-105'}`}>
          <MoveHorizontal className="w-5 h-5" />
        </div>
      </div>
      
      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
        <p className="text-white font-semibold text-center tracking-wide">{label}</p>
      </div>
    </div>
  );
};

// --- Landing Page ---
export const LandingPage = ({ onStart, onLogin }: { onStart: () => void; onLogin: () => void }) => (
  <div className="flex flex-col">
    {/* Hero Section */}
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] text-center px-4 py-16 animate-in fade-in duration-700">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-nordic-accent to-emerald-600 bg-clip-text text-transparent tracking-tight">
        Nordic Studio
      </h1>
      <p className="text-lg md:text-xl text-nordic-muted dark:text-nordic-darkMuted max-w-2xl mb-10 leading-relaxed">
        Create studio-quality product images with AI. 
        Tailored for clean, Nordic aesthetics.
      </p>
      <div className="flex gap-4">
          <Button size="lg" onClick={onStart} className="shadow-lg shadow-nordic-accent/20">
          Get started for free
          </Button>
      </div>
      
      {/* Selling Points */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          <div className="flex flex-col items-center p-6 bg-white dark:bg-nordic-darkSurface rounded-2xl border border-nordic-border dark:border-nordic-darkBorder shadow-sm transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-nordic-accent/10 rounded-xl flex items-center justify-center text-nordic-accent mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Studio Quality in Seconds</h3>
            <p className="text-sm text-nordic-muted dark:text-nordic-darkMuted leading-relaxed">
              Turn amateur snapshots into professional product photos instantly using advanced AI models.
            </p>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-white dark:bg-nordic-darkSurface rounded-2xl border border-nordic-border dark:border-nordic-darkBorder shadow-sm transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-nordic-accent/10 rounded-xl flex items-center justify-center text-nordic-accent mb-4">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Cut Costs, Not Corners</h3>
            <p className="text-sm text-nordic-muted dark:text-nordic-darkMuted leading-relaxed">
              Skip the expensive studio rentals and photographers. Get unlimited generations for a fraction of the price.
            </p>
          </div>

          <div className="flex flex-col items-center p-6 bg-white dark:bg-nordic-darkSurface rounded-2xl border border-nordic-border dark:border-nordic-darkBorder shadow-sm transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-nordic-accent/10 rounded-xl flex items-center justify-center text-nordic-accent mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Nordic Aesthetic</h3>
            <p className="text-sm text-nordic-muted dark:text-nordic-darkMuted leading-relaxed">
              Clean, minimal, and selling-focused backgrounds tailored for the modern e-commerce market.
            </p>
          </div>
      </div>
    </div>

    {/* How it Works Section */}
    <section className="py-20 bg-nordic-bg dark:bg-nordic-darkBg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-nordic-text dark:text-white">
            How it works
          </h2>
          <p className="text-lg text-nordic-muted dark:text-nordic-darkMuted max-w-3xl mx-auto">
            Go from a mobile photo to a professional result in three simple steps.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-nordic-accent/10 rounded-full flex items-center justify-center text-nordic-accent mb-6 transition-transform group-hover:scale-110">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">1. Snap a Photo</h3>
            <p className="text-sm text-nordic-muted dark:text-nordic-darkMuted leading-relaxed max-w-xs">
              Take a quick photo of your product with your phone. No studio needed.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-nordic-accent/10 rounded-full flex items-center justify-center text-nordic-accent mb-6 transition-transform group-hover:scale-110">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">2. Upload & Customize</h3>
            <p className="text-sm text-nordic-muted dark:text-nordic-darkMuted leading-relaxed max-w-xs">
              Upload your image and describe the setting or background you want.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-nordic-accent/10 rounded-full flex items-center justify-center text-nordic-accent mb-6 transition-transform group-hover:scale-110">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">3. Instant Professional Result</h3>
            <p className="text-sm text-nordic-muted dark:text-nordic-darkMuted leading-relaxed max-w-xs">
              Our AI generates a high-quality, studio-grade image in seconds.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Showcase Section */}
    <section className="py-20 bg-white dark:bg-nordic-darkSurface border-y border-nordic-border dark:border-nordic-darkBorder">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-nordic-text dark:text-white">
            See the magic of our Nordic templates
          </h2>
          <p className="text-lg text-nordic-muted dark:text-nordic-darkMuted max-w-3xl mx-auto">
            From simple mobile photos to professional studio shots in seconds.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SHOWCASE_IMAGES.map((item) => (
            <BeforeAfterSlider key={item.id} {...item} />
          ))}
        </div>
      </div>
    </section>
  </div>
);

// --- Pricing Page ---
export const PricingPage = ({ 
  onSelectPlan, 
  onLogin, 
  onCancelSubscription,
  isPro, 
  isAuthenticated,
  userEmail
}: { 
  onSelectPlan: (plan: 'starter' | 'pro') => void; 
  onLogin: () => void; 
  onCancelSubscription?: () => void;
  isPro?: boolean; 
  isAuthenticated: boolean;
  userEmail?: string;
}) => (
   <div className="py-16 px-4 max-w-5xl mx-auto">
     <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-nordic-text dark:text-white">Simple Pricing</h2>
        {isAuthenticated ? (
          <p className="text-lg text-nordic-accent dark:text-nordic-accent max-w-2xl mx-auto font-medium">
            Hello, {userEmail}! Manage your plan below.
          </p>
        ) : (
          <p className="text-lg text-nordic-muted max-w-2xl mx-auto">
            No hidden costs. Start for free and upgrade as you scale.
          </p>
        )}
     </div>
     <div className="grid md:grid-cols-2 gap-8 items-stretch mb-12">
       {/* Starter */}
       <div className="p-8 rounded-3xl border border-nordic-border dark:border-nordic-darkBorder bg-white dark:bg-nordic-darkSurface shadow-card flex flex-col justify-between transition-transform hover:-translate-y-1">
         <div>
            <h3 className="text-xl font-bold mb-2 text-nordic-text dark:text-white">Starter</h3>
            <p className="text-3xl font-bold mb-6">Free</p>
            <ul className="space-y-4 mb-8 text-nordic-muted dark:text-nordic-darkMuted">
                <li className="flex items-center"><Check className="w-5 h-5 mr-3 text-emerald-500"/> 3 daily generations</li>
                <li className="flex items-center"><Check className="w-5 h-5 mr-3 text-emerald-500"/> Standard resolution (1K)</li>
                <li className="flex items-center"><Check className="w-5 h-5 mr-3 text-emerald-500"/> Access to basic templates</li>
            </ul>
         </div>
         <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => isAuthenticated ? null : onLogin()} 
            disabled={isAuthenticated}
         >
            {!isAuthenticated ? 'Try now' : (isPro ? 'Basic Plan' : 'Current Plan')}
         </Button>
       </div>
       {/* Pro */}
       <div className="p-8 rounded-3xl border-2 border-nordic-accent dark:border-nordic-darkAccent bg-white dark:bg-nordic-darkSurface relative shadow-2xl shadow-nordic-accent/10 flex flex-col justify-between transform scale-105 transition-transform hover:scale-[1.06]">
         <div className="absolute top-0 right-0 bg-nordic-accent text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">Most Popular</div>
         <div>
             <h3 className="text-xl font-bold mb-2 text-nordic-text dark:text-white">Pro</h3>
             <p className="text-3xl font-bold mb-6">299 kr <span className="text-base font-normal text-nordic-muted">/mo</span></p>
             <ul className="space-y-4 mb-8 text-nordic-muted dark:text-nordic-darkMuted">
                <li className="flex items-center"><Check className="w-5 h-5 mr-3 text-emerald-500"/> Unlimited generations</li>
                <li className="flex items-center"><Check className="w-5 h-5 mr-3 text-emerald-500"/> 4K Ultra-HD resolution</li>
                <li className="flex items-center"><Check className="w-5 h-5 mr-3 text-emerald-500"/> Commercial license</li>
                <li className="flex items-center"><Check className="w-5 h-5 mr-3 text-emerald-500"/> Priority support</li>
             </ul>
         </div>
         <div>
           <Button 
              variant="primary" 
              className="w-full mb-3" 
              onClick={() => isAuthenticated ? onSelectPlan('pro') : onLogin()}
              disabled={isAuthenticated && isPro}
           >
              {!isAuthenticated ? 'Upgrade to Pro' : (isPro ? 'Your Plan' : 'Upgrade to Pro')}
           </Button>
           {isAuthenticated && isPro && (
             <button 
               onClick={onCancelSubscription}
               className="w-full text-xs text-nordic-muted hover:text-red-500 underline transition-colors"
             >
               Cancel subscription
             </button>
           )}
         </div>
       </div>
     </div>
     {!isAuthenticated && (
       <div className="text-center">
          <p className="text-nordic-muted dark:text-nordic-darkMuted">
            Already have an account?{' '}
            <button 
              onClick={onLogin}
              className="text-nordic-accent font-semibold hover:underline"
            >
              Sign in here
            </button>
          </p>
       </div>
     )}
   </div>
);

// --- Features Page ---
export const FeaturesPage = () => (
  <div className="py-20 max-w-7xl mx-auto px-6">
    <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-nordic-text dark:text-white">Why choose Nordic Studio?</h2>
        <p className="text-lg text-nordic-muted max-w-3xl mx-auto">We combine advanced AI with timeless Scandinavian design philosophy.</p>
    </div>
    <div className="grid md:grid-cols-3 gap-12">
       <div className="bg-white dark:bg-nordic-darkSurface p-8 rounded-2xl shadow-card hover:shadow-lg transition-all hover:-translate-y-1 border border-nordic-border dark:border-nordic-darkBorder">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-nordic-text dark:text-white">Lightning Fast Generation</h3>
          <p className="text-sm text-nordic-muted dark:text-nordic-darkMuted leading-relaxed">
            Get professional results in seconds with our optimized engine. No waiting, no complex prompts.
          </p>
       </div>
       <div className="bg-white dark:bg-nordic-darkSurface p-8 rounded-2xl shadow-card hover:shadow-lg transition-all hover:-translate-y-1 border border-nordic-border dark:border-nordic-darkBorder">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
            <LayoutTemplate className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-nordic-text dark:text-white">Nordic Templates</h3>
          <p className="text-sm text-nordic-muted dark:text-nordic-darkMuted leading-relaxed">
            Exclusive scenes designed for the modern market. Minimalism, natural light, and organic materials.
          </p>
       </div>
       <div className="bg-white dark:bg-nordic-darkSurface p-8 rounded-2xl shadow-card hover:shadow-lg transition-all hover:-translate-y-1 border border-nordic-border dark:border-nordic-darkBorder">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-nordic-text dark:text-white">Commercial Use</h3>
          <p className="text-sm text-nordic-muted dark:text-nordic-darkMuted leading-relaxed">
            All images you generate are yours and can be used freely in marketing, social media, and online stores without restrictions.
          </p>
       </div>
    </div>
  </div>
);

// --- FAQ Page ---
export const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: "How does the credit system work?", a: "Each image generation costs 1 credit. When you sign up, you get 5 free credits. You can purchase additional credit packs or subscribe to Pro for a monthly allowance." },
    { q: "Can I use the images for commercial purposes?", a: "Yes. All images generated with Nordic Studio are yours to use commercially for your e-commerce store, marketing materials, and social media." },
    { q: "What file formats do you support?", a: "We currently support uploading JPG and PNG files. Generated images are provided as high-quality PNGs." },
    { q: "How do I cancel my subscription?", a: "You can cancel your Pro subscription at any time from the Settings tab in your dashboard. Your benefits will continue until the end of the billing period." },
    { q: "Do you offer refunds?", a: "We generally do not offer refunds for used credits or partial subscription periods. However, if you experience technical issues, please contact our support team." }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto py-20 px-6">
        <div className="text-center mb-16">
            <h1 className="text-3xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-nordic-muted">Everything you need to know about Nordic Studio.</p>
        </div>
        <div className="space-y-4">
            {faqs.map((faq, index) => (
                <div 
                    key={index} 
                    className="bg-white dark:bg-nordic-darkSurface rounded-xl border border-nordic-border dark:border-nordic-darkBorder shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
                    onClick={() => toggleFAQ(index)}
                >
                    <div className="p-6 flex justify-between items-center">
                        <h3 className="text-base font-semibold text-nordic-text dark:text-white">{faq.q}</h3>
                        <ChevronDown 
                            className={`w-5 h-5 text-nordic-muted transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
                        />
                    </div>
                    <div 
                        className={`px-6 text-nordic-muted dark:text-nordic-darkMuted leading-relaxed overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0'}`}
                    >
                        <p className="text-sm">{faq.a}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export const LegalPage = ({ title }: { title: string }) => (
    <div className="max-w-3xl mx-auto py-20 px-6 prose dark:prose-invert">
        <h1 className="text-4xl font-bold mb-8">{title}</h1>
        <p>This is the legal text for {title}.</p>
        <p className="text-sm text-nordic-muted mt-8">Last updated: {new Date().toLocaleDateString()}</p>
    </div>
);

// --- Contact Page ---
export const ContactPage = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Your message has been sent! We will contact you soon.");
    };

    return (
        <div className="max-w-xl mx-auto py-20 px-6">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
                <p className="text-nordic-muted">Have questions or need help? Send us a message.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-nordic-darkSurface p-8 rounded-2xl border border-nordic-border dark:border-nordic-darkBorder shadow-card">
                <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input 
                        type="text" 
                        required 
                        className="w-full px-4 py-2 rounded-lg border border-nordic-border dark:border-nordic-darkBorder bg-nordic-bg dark:bg-nordic-darkClay"
                        placeholder="Your name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input 
                        type="email" 
                        required 
                        className="w-full px-4 py-2 rounded-lg border border-nordic-border dark:border-nordic-darkBorder bg-nordic-bg dark:bg-nordic-darkClay"
                        placeholder="your@email.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea 
                        required 
                        rows={5}
                        className="w-full px-4 py-2 rounded-lg border border-nordic-border dark:border-nordic-darkBorder bg-nordic-bg dark:bg-nordic-darkClay"
                        placeholder="How can we help you?"
                    ></textarea>
                </div>
                <Button type="submit" className="w-full">Send message</Button>
            </form>
        </div>
    );
};