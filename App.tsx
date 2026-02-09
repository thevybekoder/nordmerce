import React, { useState, useRef, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Button } from './components/Button';
import { ViewState, DashboardTab, Product, GeneratedImage, Template } from './types';
import { TEMPLATES } from './constants';
import { generateImageViaApi } from './services/geminiService';
import { AuthUser } from './services/authService'; // Fjernet ubrukte imports
import { createCheckoutSession } from './services/billingService';
import { supabase } from './src/supabaseClient';
import { 
  Upload, 
  Image as ImageIcon, 
  Settings, 
  CreditCard, 
  Download, 
  Check, 
  Plus, 
  Trash2,
  Maximize2,
  ShieldCheck,
  Zap,
  LayoutTemplate,
  X
} from 'lucide-react';

// --- Static Page Components ---

const FeaturesPage: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 py-20">
    <div className="text-center mb-16">
      <h1 className="text-4xl font-bold mb-4">Enterprise-grade Features</h1>
      <p className="text-xl text-nordic-muted dark:text-nordic-darkMuted">Everything you need to scale your content production.</p>
    </div>
    <div className="grid md:grid-cols-3 gap-10">
      <div className="p-8 bg-white dark:bg-nordic-darkSurface rounded-2xl shadow-card border border-nordic-border dark:border-nordic-darkBorder">
        <div className="w-12 h-12 bg-nordic-accent/10 rounded-lg flex items-center justify-center mb-6 text-nordic-accent">
          <Zap className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-semibold mb-3">Instant Rendering</h3>
        <p className="text-nordic-muted dark:text-nordic-darkMuted">Generate 4K assets in under 30 seconds using our proprietary Gemini 3 pipeline.</p>
      </div>
      <div className="p-8 bg-white dark:bg-nordic-darkSurface rounded-2xl shadow-card border border-nordic-border dark:border-nordic-darkBorder">
        <div className="w-12 h-12 bg-nordic-accent/10 rounded-lg flex items-center justify-center mb-6 text-nordic-accent">
          <LayoutTemplate className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-semibold mb-3">Smart Templates</h3>
        <p className="text-nordic-muted dark:text-nordic-darkMuted">Context-aware templates that adjust lighting and perspective to match your product perfectly.</p>
      </div>
      <div className="p-8 bg-white dark:bg-nordic-darkSurface rounded-2xl shadow-card border border-nordic-border dark:border-nordic-darkBorder">
        <div className="w-12 h-12 bg-nordic-accent/10 rounded-lg flex items-center justify-center mb-6 text-nordic-accent">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-semibold mb-3">Brand Safety</h3>
        <p className="text-nordic-muted dark:text-nordic-darkMuted">Enterprise data isolation. Your uploads and generations are private and never train public models.</p>
      </div>
    </div>
  </div>
);

interface PricingProps {
  onSelectPlan: (plan: 'starter' | 'pro') => void;
}

const PricingPage: React.FC<PricingProps> = ({ onSelectPlan }) => (
  <div className="max-w-7xl mx-auto px-4 py-20">
    <div className="text-center mb-16">
      <h1 className="text-4xl font-bold mb-4">Choose your plan</h1>
      <p className="text-xl text-nordic-muted dark:text-nordic-darkMuted">Simple transparent pricing</p>
    </div>
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      
      {/* Starter Plan */}
      <div className="p-8 rounded-2xl border border-nordic-border bg-white dark:bg-nordic-darkSurface flex flex-col">
        <h3 className="text-2xl font-semibold mb-2">Starter</h3>
        <div className="text-4xl font-bold mb-6">Gratis <span className="text-base font-normal text-nordic-muted">/start</span></div>
        <ul className="space-y-4 mb-8 flex-grow">
          <li className="flex items-center"><Check className="w-4 h-4 mr-2" /> 5 Free Credits</li>
          <li className="flex items-center"><Check className="w-4 h-4 mr-2" /> Pay as you go later</li>
        </ul>
        <Button variant="outline" className="w-full" onClick={() => onSelectPlan('starter')}>
          Select Starter
        </Button>
      </div>

      {/* Pro Plan */}
      <div className="p-8 rounded-2xl border border-nordic-accent bg-nordic-accent/5 dark:bg-nordic-accent/10 flex flex-col relative">
        <div className="absolute top-0 right-0 bg-nordic-accent text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg">POPULAR</div>
        <h3 className="text-2xl font-semibold mb-2">Pro</h3>
        <div className="text-4xl font-bold mb-6">199 kr <span className="text-base font-normal text-nordic-muted">/mo</span></div>
        <ul className="space-y-4 mb-8 flex-grow">
          <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-nordic-accent" /> Monthly Subscription</li>
          <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-nordic-accent" /> 500 Credits / mo</li>
          <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-nordic-accent" /> Priority Generation</li>
        </ul>
        <Button variant="primary" className="w-full" onClick={() => onSelectPlan('pro')}>
          Select Pro
        </Button>
      </div>

    </div>
  </div>
);

const ResourcesPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-20">
    <h1 className="text-3xl font-bold mb-8">Resources</h1>
    <div className="space-y-8">
      <div className="bg-white dark:bg-nordic-darkSurface p-6 rounded-xl border border-nordic-border dark:border-nordic-darkBorder">
        <h3 className="text-xl font-semibold mb-2">Getting Started Guide</h3>
        <p className="text-nordic-muted dark:text-nordic-darkMuted mb-4">Learn the basics of product photography automation.</p>
        <a href="#" className="text-nordic-accent font-medium hover:underline">Read Article →</a>
      </div>
      <div className="bg-white dark:bg-nordic-darkSurface p-6 rounded-xl border border-nordic-border dark:border-nordic-darkBorder">
        <h3 className="text-xl font-semibold mb-2">Prompt Engineering 101</h3>
        <p className="text-nordic-muted dark:text-nordic-darkMuted mb-4">How to describe your product for the best results.</p>
        <a href="#" className="text-nordic-accent font-medium hover:underline">Read Article →</a>
      </div>
    </div>
  </div>
);

const LegalPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="max-w-3xl mx-auto px-4 py-20">
    <h1 className="text-3xl font-bold mb-8">{title}</h1>
    <div className="prose dark:prose-invert">
      <p className="text-nordic-muted dark:text-nordic-darkMuted">
        Last updated: February 2024
      </p>
      <br/>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
    </div>
  </div>
);

const BeforeAfterCard: React.FC<{ beforeSrc: string; afterSrc: string; label: string }> = ({ beforeSrc, afterSrc, label }) => {
  return (
    <div className="flex flex-col space-y-3">
      <div className="grid grid-cols-2 gap-2 bg-white dark:bg-nordic-darkSurface p-2 rounded-xl shadow-soft">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-nordic-clay dark:bg-nordic-darkClay">
          <img src={beforeSrc} alt="Before" className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-medium">Input</div>
        </div>
        <div className="relative aspect-square rounded-lg overflow-hidden bg-nordic-clay dark:bg-nordic-darkClay">
          <img src={afterSrc} alt="After" className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2 bg-nordic-accent text-white text-[10px] px-2 py-0.5 rounded font-medium">Generated</div>
        </div>
      </div>
      <div className="text-center">
        <p className="font-medium text-nordic-text dark:text-white">{label}</p>
      </div>
    </div>
  );
};

const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="flex flex-col">
    <section className="py-20 md:py-32 px-4 max-w-7xl mx-auto text-center">
      <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-nordic-text dark:text-white mb-6">
        Professional product images.<br />
        <span className="text-nordic-muted dark:text-nordic-darkMuted">No photoshoot required.</span>
      </h1>
      <p className="text-xl text-nordic-muted dark:text-nordic-darkMuted max-w-2xl mx-auto mb-10 font-light">
        Generate consistent, high-fidelity marketing assets from a single photo. 
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center">
        <Button size="lg" onClick={onStart}>Start Generating</Button>
      </div>
    </section>

    <section className="bg-white dark:bg-nordic-darkSurface py-20 border-y border-nordic-border dark:border-nordic-darkBorder">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-4">Transform your catalog</h2>
          <p className="text-nordic-muted dark:text-nordic-darkMuted">See the difference professional AI generation makes.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <BeforeAfterCard 
             beforeSrc="https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=400&auto=format&fit=crop"
             afterSrc="https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=400&auto=format&fit=crop"
             label="Studio Minimal"
           />
           <BeforeAfterCard 
             beforeSrc="https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=400&auto=format&fit=crop"
             afterSrc="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop"
             label="Lifestyle Outdoor"
           />
           <BeforeAfterCard 
             beforeSrc="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=400&auto=format&fit=crop"
             afterSrc="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=400&auto=format&fit=crop"
             label="Dark Mode Luxury"
           />
        </div>
      </div>
    </section>

    <section className="py-20 max-w-7xl mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-12 text-center">
        <div>
          <div className="w-12 h-12 bg-nordic-clay dark:bg-nordic-darkClay rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6 text-nordic-accent dark:text-white" />
          </div>
          <h3 className="font-semibold text-lg mb-2">1. Upload Product</h3>
          <p className="text-nordic-muted dark:text-nordic-darkMuted">Drag and drop your raw product shots.</p>
        </div>
        <div>
          <div className="w-12 h-12 bg-nordic-clay dark:bg-nordic-darkClay rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-6 h-6 text-nordic-accent dark:text-white" />
          </div>
          <h3 className="font-semibold text-lg mb-2">2. Choose Template</h3>
          <p className="text-nordic-muted dark:text-nordic-darkMuted">Select from our curated library.</p>
        </div>
        <div>
          <div className="w-12 h-12 bg-nordic-clay dark:bg-nordic-darkClay rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-6 h-6 text-nordic-accent dark:text-white" />
          </div>
          <h3 className="font-semibold text-lg mb-2">3. Export 4K</h3>
          <p className="text-nordic-muted dark:text-nordic-darkMuted">Get print-ready 4K assets in seconds.</p>
        </div>
      </div>
    </section>
  </div>
);

// --- Main App Component ---

export default function App() {
  // State
  const [view, setView] = useState<ViewState>('landing');
  const [activeTab, setActiveTab] = useState<DashboardTab>('upload');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<'1K' | '2K' | '4K'>('1K');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [credits, setCredits] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  
  // Auth State
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  
  // New State for Flow
  const [pendingPlan, setPendingPlan] = useState<'starter' | 'pro' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Auth Session Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleSession(session);
    });
  
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleSession(session);
      } else {
        setCurrentUser(null);
        setAuthToken(null);
        setCredits(0);
      }
    });
  
    return () => subscription.unsubscribe();
  }, []);

  // Handle Session Logic
  const handleSession = async (session: any) => {
    setAuthToken(session.access_token);
    setCurrentUser({ id: session.user.id, email: session.user.email });
  
    const { data } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', session.user.id)
      .single();
  
    if (data) setCredits(data.credits);
  };

  // Handle Post-Login Redirect Logic (Payment vs Dashboard)
  useEffect(() => {
    if (currentUser && pendingPlan === 'pro') {
      // User logged in and wanted Pro -> Send to Stripe
      handleSubscribe();
      setPendingPlan(null); // Clear pending so we don't loop
    }
  }, [currentUser, pendingPlan]);

  // Handle Subscription (Stripe)
  const handleSubscribe = async () => {
    if (!authToken) return;
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:4000'}/api/billing/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      alert("Kunne ikke starte abonnement.");
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);
  
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        alert("Sjekk e-posten din for å bekrefte kontoen!");
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('landing');
    setPendingPlan(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64Data = result.split(',')[1];
        
        const newProduct: Product = {
          id: Date.now().toString(),
          name: file.name.split('.')[0],
          sku: `SKU-${Math.floor(Math.random() * 1000)}`,
          imageUrl: result,
          base64Data: base64Data,
          mimeType: file.type
        };
        setProducts(prev => [newProduct, ...prev]);
        setSelectedProduct(newProduct);
        setActiveTab('generate');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedProduct || !selectedTemplate || !selectedProduct.base64Data) return;

    if (!authToken) {
      setView('landing');
      return;
    }

    if (credits < 1) {
      alert("Insufficient credits. Please top up in Settings.");
      setActiveTab('settings');
      return;
    }

    setIsGenerating(true);
    try {
      const generatedBase64 = await generateImageViaApi(
        {
          base64Image: selectedProduct.base64Data,
          mimeType: selectedProduct.mimeType || 'image/jpeg',
          prompt: selectedTemplate.promptModifier,
          resolution: selectedResolution
        },
        authToken
      );

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        productId: selectedProduct.id,
        templateId: selectedTemplate.id,
        imageUrl: generatedBase64,
        createdAt: Date.now(),
        resolution: selectedResolution
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      setCredits(prev => prev - 1); // Deduct credit
      setActiveTab('gallery');
      
    } catch (error) {
      alert((error as any).message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (e: React.MouseEvent, imageUrl: string, id: string) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `nordic-studio-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <div className="max-w-2xl mx-auto py-12 px-4">
            <h2 className="text-2xl font-semibold mb-6">Upload Product</h2>
            <div 
              className="border-2 border-dashed border-nordic-border dark:border-nordic-darkBorder rounded-xl p-12 text-center hover:bg-white dark:hover:bg-nordic-darkSurface hover:border-nordic-accent transition-colors cursor-pointer bg-gray-50 dark:bg-nordic-darkSurface/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
              />
              <div className="w-16 h-16 bg-white dark:bg-nordic-darkSurface rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-nordic-accent" />
              </div>
              <h3 className="text-lg font-medium text-nordic-text dark:text-white">Click to upload or drag and drop</h3>
              <p className="text-nordic-muted dark:text-nordic-darkMuted mt-2">Supports JPG, PNG (Max 10MB)</p>
              <p className="text-xs text-nordic-muted dark:text-nordic-darkMuted mt-6">
                By uploading, you confirm you own the rights to this image.
              </p>
            </div>

            {products.length > 0 && (
              <div className="mt-12">
                <h3 className="text-lg font-medium mb-4">Recent Uploads</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {products.map(p => (
                    <div 
                      key={p.id} 
                      className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedProduct?.id === p.id ? 'border-nordic-accent ring-2 ring-nordic-accent/20' : 'border-transparent'}`}
                      onClick={() => {
                        setSelectedProduct(p);
                        setActiveTab('generate');
                      }}
                    >
                      <img src={p.imageUrl} alt={p.name} className="w-full h-32 object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-nordic-darkSurface/90 p-2 text-xs font-medium truncate">
                        {p.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'generate':
        return (
          <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-8">
              {/* Product Selection Preview */}
              <div className="bg-white dark:bg-nordic-darkSurface p-6 rounded-xl shadow-card border border-nordic-border dark:border-nordic-darkBorder">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-semibold">Selected Product</h3>
                   <button onClick={() => setActiveTab('upload')} className="text-xs text-nordic-accent font-medium hover:underline">Change</button>
                </div>
                {selectedProduct ? (
                  <div className="aspect-square bg-nordic-clay dark:bg-nordic-darkClay rounded-lg overflow-hidden relative">
                    <img src={selectedProduct.imageUrl} className="w-full h-full object-contain" alt="Product" />
                  </div>
                ) : (
                  <div className="text-center py-8 text-nordic-muted dark:text-nordic-darkMuted text-sm bg-gray-50 dark:bg-nordic-darkClay/20 rounded-lg border border-dashed border-nordic-border dark:border-nordic-darkBorder">
                    No product selected
                  </div>
                )}
              </div>

              {/* Resolution Settings */}
              <div className="bg-white dark:bg-nordic-darkSurface p-6 rounded-xl shadow-card border border-nordic-border dark:border-nordic-darkBorder">
                 <h3 className="font-semibold mb-4">Output Quality</h3>
                 <div className="grid grid-cols-3 gap-3">
                    {(['1K', '2K', '4K'] as const).map((res) => (
                      <button
                        key={res}
                        onClick={() => setSelectedResolution(res)}
                        className={`py-2 text-sm font-medium rounded-md border transition-all ${
                          selectedResolution === res 
                          ? 'border-nordic-accent bg-nordic-accent/5 text-nordic-accent dark:text-white dark:bg-nordic-accent/20' 
                          : 'border-nordic-border dark:border-nordic-darkBorder hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                 </div>
                 <p className="text-xs text-nordic-muted dark:text-nordic-darkMuted mt-3">
                   Higher resolutions require more processing credits.
                 </p>
              </div>

              {/* Action */}
              <Button 
                size="lg" 
                className="w-full" 
                disabled={!selectedProduct || !selectedTemplate}
                onClick={handleGenerate}
                isLoading={isGenerating}
              >
                Generate Image
              </Button>
            </div>

            {/* Template Grid */}
            <div className="lg:col-span-8">
              <h2 className="text-2xl font-semibold mb-6">Select Template</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TEMPLATES.map(template => (
                  <div 
                    key={template.id}
                    className={`bg-white dark:bg-nordic-darkSurface rounded-xl overflow-hidden shadow-card cursor-pointer transition-all hover:shadow-soft border ${selectedTemplate?.id === template.id ? 'border-nordic-accent ring-2 ring-nordic-accent ring-offset-2 dark:ring-offset-nordic-darkBg' : 'border-nordic-border dark:border-nordic-darkBorder'}`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="aspect-[4/3] bg-gray-200 dark:bg-nordic-darkClay relative">
                      <img src={template.thumbnail} className="w-full h-full object-cover" alt={template.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                      <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md">Preview</span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-nordic-text dark:text-white">{template.title}</h4>
                      <p className="text-sm text-nordic-muted dark:text-nordic-darkMuted mt-1 line-clamp-2">{template.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold">Gallery</h2>
              <div className="flex space-x-2">
                 <Button variant="outline" size="sm">Export CSV</Button>
                 <Button variant="outline" size="sm">Bulk Download</Button>
              </div>
            </div>
            
            {generatedImages.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-nordic-darkSurface rounded-xl border border-dashed border-nordic-border dark:border-nordic-darkBorder">
                <div className="w-16 h-16 bg-gray-50 dark:bg-nordic-darkClay rounded-full flex items-center justify-center mx-auto mb-4 text-nordic-muted dark:text-nordic-darkMuted">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <p className="text-nordic-muted dark:text-nordic-darkMuted">No images generated yet.</p>
                <Button variant="ghost" className="mt-4" onClick={() => setActiveTab('generate')}>Go to Generator</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {generatedImages.map(img => (
                  <div key={img.id} className="bg-white dark:bg-nordic-darkSurface rounded-xl shadow-card overflow-hidden group border border-nordic-border dark:border-nordic-darkBorder">
                    <div className="relative aspect-square bg-nordic-clay dark:bg-nordic-darkClay cursor-pointer" onClick={() => setFullscreenImage(img.imageUrl)}>
                      <img src={img.imageUrl} alt="Generated result" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                        <button 
                          className="p-2 bg-white rounded-full hover:bg-gray-100 dark:text-black transition-transform hover:scale-105" 
                          title="Download"
                          onClick={(e) => handleDownload(e, img.imageUrl, img.id)}
                        >
                           <Download className="w-5 h-5" />
                        </button>
                        <button 
                          className="p-2 bg-white rounded-full hover:bg-gray-100 dark:text-black transition-transform hover:scale-105" 
                          title="View Fullscreen"
                          onClick={(e) => { e.stopPropagation(); setFullscreenImage(img.imageUrl); }}
                        >
                           <Maximize2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-black/50 text-white text-xs font-medium rounded backdrop-blur-sm">
                          {img.resolution}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                       <div>
                         <p className="text-sm font-medium text-nordic-text dark:text-white">
                           {TEMPLATES.find(t => t.id === img.templateId)?.title || 'Custom'}
                         </p>
                         <p className="text-xs text-nordic-muted dark:text-nordic-darkMuted">
                           {new Date(img.createdAt).toLocaleDateString()}
                         </p>
                       </div>
                       <button 
                        className="text-nordic-muted hover:text-red-500 transition-colors"
                        onClick={() => setGeneratedImages(prev => prev.filter(i => i.id !== img.id))}
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

        case 'settings':
          return (
            <div className="max-w-2xl mx-auto py-12 px-4">
              <h2 className="text-2xl font-semibold mb-6">Organization Settings</h2>
              
              <div className="bg-white dark:bg-nordic-darkSurface rounded-xl shadow-card p-6 mb-6 border border-nordic-border dark:border-nordic-darkBorder">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-nordic-accent" />
                  Billing & Credits
                </h3>
                <div className="flex justify-between items-center p-4 bg-nordic-bg dark:bg-nordic-darkClay rounded-lg mb-4">
                  <div>
                    <p className="text-sm font-medium">Available Credits</p>
                    <p className="text-2xl font-bold text-nordic-accent dark:text-white">{credits}</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (!authToken) return;
                      createCheckoutSession(authToken, 10).catch((err) =>
                        alert(err.message || 'Failed to start checkout')
                      );
                    }}
                  >
                    Buy credits
                  </Button>
                </div>
                <div className="text-sm text-nordic-muted dark:text-nordic-darkMuted">
                  <p>Standard generation (1K): 1 credit</p>
                  <p>High-res generation (4K): 3 credits</p>
                </div>
              </div>

              <div className="bg-white dark:bg-nordic-darkSurface rounded-xl shadow-card p-6 border border-nordic-border dark:border-nordic-darkBorder">
                <h3 className="text-lg font-medium mb-4">Account</h3>
                <p className="text-sm text-nordic-muted dark:text-nordic-darkMuted mb-4">
                  {currentUser ? `Logged in as ${currentUser.email}` : 'Not logged in'}
                </p>
                <Button variant="outline" size="sm" onClick={handleLogout}>Sign Out</Button>
              </div>
            </div>
          );
      default:
        return null;
    }
  };

  // --- Main View Switcher ---

  const renderCurrentView = () => {
    // 1. Hvis brukeren er logget inn
    if (currentUser) {
      // Sjekk om brukeren kom fra Pricing og valgte Pro
      if (pendingPlan === 'pro') {
         // Vis en loading tekst mens vi omdirigerer i useEffect
         return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nordic-accent mx-auto mb-4"></div>
              <p className="text-xl">Redirecting to secure payment...</p>
            </div>
          </div>
         );
      }
      
      // Ellers vis vanlig dashboard
      if (view === 'dashboard' || view === 'landing') return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
            {/* Dashboard Sidebar */}
            <aside className="w-full md:w-64 bg-white dark:bg-nordic-darkSurface border-r border-nordic-border dark:border-nordic-darkBorder flex-shrink-0 z-10 md:h-full overflow-y-auto">
              <div className="p-6">
                <nav className="space-y-2">
                  <button 
                    onClick={() => setActiveTab('upload')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'upload' ? 'bg-nordic-bg dark:bg-nordic-darkClay text-nordic-accent dark:text-white' : 'text-nordic-muted dark:text-nordic-darkMuted hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    <Upload className="w-5 h-5" />
                    <span>Uploads</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('generate')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'generate' ? 'bg-nordic-bg dark:bg-nordic-darkClay text-nordic-accent dark:text-white' : 'text-nordic-muted dark:text-nordic-darkMuted hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span>Generate</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('gallery')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'gallery' ? 'bg-nordic-bg dark:bg-nordic-darkClay text-nordic-accent dark:text-white' : 'text-nordic-muted dark:text-nordic-darkMuted hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    <Download className="w-5 h-5" />
                    <span>Gallery</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-nordic-bg dark:bg-nordic-darkClay text-nordic-accent dark:text-white' : 'text-nordic-muted dark:text-nordic-darkMuted hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </button>
                </nav>

                <div className="mt-12 p-4 bg-nordic-bg dark:bg-nordic-darkClay rounded-lg border border-nordic-border dark:border-nordic-darkBorder">
                  <p className="text-xs font-semibold text-nordic-text dark:text-white mb-2">CREDIT BALANCE</p>
                  <div className="flex items-baseline space-x-1 mb-3">
                    <span className="text-2xl font-bold text-nordic-accent dark:text-white">{credits}</span>
                    <span className="text-xs text-nordic-muted dark:text-nordic-darkMuted">remaining</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => { setActiveTab('settings'); }}>Get More</Button>
                </div>
              </div>
            </aside>

            {/* Dashboard Content */}
            <section className="flex-grow overflow-y-auto bg-nordic-bg dark:bg-nordic-darkBg scroll-smooth">
               {renderDashboardContent()}
            </section>
          </div>
      );
    }

    // 2. Hvis brukeren IKKE er logget inn
    switch (view) {
      case 'landing':
        // Landingsside leder nå til Pricing
        return <LandingPage onStart={() => setView('pricing')} />;

      case 'pricing':
        // Pricing leder til Auth med valgt plan
        return <PricingPage onSelectPlan={(plan) => {
          setPendingPlan(plan);
          setAuthMode('register'); 
          setView('auth' as ViewState); // Merk: Du må kanskje legge til 'auth' i types.ts
        }} />;

      case 'auth' as ViewState: 
        return (
          <div className="max-w-md mx-auto py-16 px-4">
            <h1 className="text-3xl font-bold mb-6">
              {pendingPlan ? `Finish setup for ${pendingPlan}` : 'Welcome Back'}
            </h1>
            <p className="text-nordic-muted mb-6">Create an account to continue.</p>
            
            <form
              onSubmit={handleAuthSubmit}
              className="space-y-4 bg-white dark:bg-nordic-darkSurface p-6 rounded-xl border border-nordic-border dark:border-nordic-darkBorder"
            >
              <div className="flex space-x-2 mb-2">
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-md ${
                    authMode === 'login'
                      ? 'bg-nordic-accent text-white'
                      : 'bg-nordic-clay text-nordic-text'
                  }`}
                  onClick={() => setAuthMode('login')}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-md ${
                    authMode === 'register'
                      ? 'bg-nordic-accent text-white'
                      : 'bg-nordic-clay text-nordic-text'
                  }`}
                  onClick={() => setAuthMode('register')}
                >
                  Sign up
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-nordic-border dark:border-nordic-darkBorder bg-white dark:bg-nordic-darkClay text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-nordic-border dark:border-nordic-darkBorder bg-white dark:bg-nordic-darkClay text-sm"
                />
              </div>
              {authError && (
                <p className="text-sm text-red-500">{authError}</p>
              )}
              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isAuthLoading}
              >
                {authMode === 'login' ? 'Log in' : 'Create account & Continue'}
              </Button>
            </form>
          </div>
        );

      case 'features': return <FeaturesPage />;
      case 'resources': return <ResourcesPage />;
      case 'privacy': return <LegalPage title="Privacy Policy" />;
      case 'terms': return <LegalPage title="Terms of Service" />;
      default: return null;
    }
  };

  return (
    <Layout view={view} setView={setView} isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
      {renderCurrentView()}
      
      {/* Fullscreen Overlay */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setFullscreenImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setFullscreenImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={fullscreenImage} 
            className="max-w-full max-h-full object-contain shadow-2xl rounded-sm" 
            onClick={(e) => e.stopPropagation()} 
            alt="Fullscreen preview"
          />
        </div>
      )}
    </Layout>
  );
}