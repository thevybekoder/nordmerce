import React, { useState, useRef, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Button } from './components/Button';
import { ViewState, DashboardTab, Product, GeneratedImage, Template } from './types';
import { TEMPLATES } from './constants';
import { generateImageViaApi } from './services/geminiService';
import { AuthUser } from './services/authService'; 
import { createCheckoutSession } from './services/billingService';
import { supabase } from './src/supabaseClient';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';

// HER ER FIKSEN: Vi importerer sidene fra den nye filen din
import { 
  LandingPage, 
  PricingPage, 
  FeaturesPage, 
  ResourcesPage, 
  LegalPage,
  ContactPage
} from './components/StaticPages';

import { 
  Upload, 
  Image as ImageIcon, 
  Settings, 
  CreditCard, 
  Download, 
  Plus, 
  Trash2,
  Maximize2,
  X
} from 'lucide-react';

export default function App() {
  // Existing State
  const [view, setView] = useState<ViewState>('landing');
  const [activeTab, setActiveTab] = useState<DashboardTab>('upload');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<'1K' | '2K' | '4K'>('1K');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [credits, setCredits] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  
  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

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

  // Handle Stripe Redirection Feedback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      addToast("Payment successful! Credits added.", "success");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('canceled')) {
      addToast("Payment canceled.", "info");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
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
  
    // Fetch user profile credits
    const { data: profileData } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', session.user.id)
      .single();
  
    if (profileData) setCredits(profileData.credits);

    // Fetch Products
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (productsData) {
      setProducts(productsData.map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku || '',
        imageUrl: p.image_url,
        created_at: p.created_at
      })));
    }

    // Fetch Generated Images
    const { data: genData } = await supabase
      .from('generated_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (genData) {
      setGeneratedImages(genData.map((g: any) => ({
        id: g.id,
        productId: g.product_id,
        templateId: g.template_id,
        imageUrl: g.image_url,
        createdAt: g.created_at,
        resolution: g.resolution as any
      })));
    }
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
        addToast("Welcome back!", "success");
        setView('dashboard');
        setActiveTab('upload');
      } else {
        const { error, data } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        
        // If Supabase is configured for auto-confirm or returns a session
        if (data?.session) {
          addToast("Account created successfully!", "success");
          setView('dashboard');
          setActiveTab('upload');
        } else {
          addToast("Check your email to confirm your account!", "info");
        }
      }
    } catch (err: any) {
      setAuthError(err.message);
      addToast(err.message, "error");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('landing');
    setPendingPlan(null);
    setProducts([]);
    setGeneratedImages([]);
    addToast("Logged out successfully", "info");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      addToast("File too large. Max 10MB.", "error");
      return;
    }

    if (!currentUser) {
      addToast("Please log in to upload.", "error");
      return;
    }

    try {
      addToast("Uploading...", "info");
      
      // Get fresh user ID for RLS
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // 1. Upload to Storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(fileName);

      // 3. Prepare local preview and base64 for API usage
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        const base64Data = result.split(',')[1];

        // 4. Insert into DB
        const { data: productData, error: dbError } = await supabase
          .from('products')
          .insert({
            user_id: user.id, // Use fresh user.id
            name: file.name.split('.')[0],
            sku: `SKU-${Math.floor(Math.random() * 10000)}`,
            image_url: publicUrl
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // 5. Update State
        const newProduct: Product = {
          id: productData.id,
          name: productData.name,
          sku: productData.sku,
          imageUrl: publicUrl, 
          base64Data: base64Data, 
          mimeType: file.type,
          created_at: productData.created_at
        };

        setProducts(prev => [newProduct, ...prev]);
        setSelectedProduct(newProduct);
        setActiveTab('generate');
        addToast("Image uploaded and saved!", "success");
      };
      reader.readAsDataURL(file);

    } catch (error: any) {
      console.error(error);
      addToast(error.message || "Upload failed", "error");
    }
  };

  const handleGenerate = async () => {
    if (!selectedProduct || !selectedTemplate) {
      addToast("Please select a product and template first.", "info");
      return;
    }

    // Ensure we have base64 data
    if (!selectedProduct.base64Data && selectedProduct.imageUrl) {
        try {
            const resp = await fetch(selectedProduct.imageUrl);
            const blob = await resp.blob();
            const reader = new FileReader();
            reader.onloadend = () => {
                 const base64 = (reader.result as string).split(',')[1];
                 selectedProduct.base64Data = base64;
                 selectedProduct.mimeType = blob.type;
                 executeGeneration();
            }
            reader.readAsDataURL(blob);
            return;
        } catch (e) {
            addToast("Could not prepare image for generation.", "error");
            return;
        }
    }

    executeGeneration();
  };

  const executeGeneration = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!authToken || !user || !selectedProduct || !selectedTemplate) {
        addToast("Authentication error. Please log in again.", "error");
        return;
    }

    if (credits < 1) {
      addToast("Insufficient credits. Please top up in Settings.", "error");
      setActiveTab('settings');
      return;
    }

    setIsGenerating(true);
    try {
      const generatedBase64Uri = await generateImageViaApi(
        {
          base64Image: selectedProduct.base64Data!,
          mimeType: selectedProduct.mimeType || 'image/jpeg',
          prompt: selectedTemplate.promptModifier,
          resolution: selectedResolution
        },
        authToken
      );

      // Convert Data URI to Blob for Upload
      const res = await fetch(generatedBase64Uri);
      const blob = await res.blob();
      
      // Upload Generated Image
      const fileName = `${user.id}/gen-${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from('generated-results')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('generated-results')
        .getPublicUrl(fileName);

      // Insert into DB
      const { data: genRow, error: dbError } = await supabase
        .from('generated_images')
        .insert({
            user_id: user.id, // Use fresh user.id
            product_id: selectedProduct.id,
            template_id: selectedTemplate.id,
            image_url: publicUrl,
            resolution: selectedResolution
        })
        .select()
        .single();

      if (dbError) throw dbError;

      const newImage: GeneratedImage = {
        id: genRow.id,
        productId: selectedProduct.id,
        templateId: selectedTemplate.id,
        imageUrl: publicUrl,
        createdAt: genRow.created_at,
        resolution: selectedResolution
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      setCredits(prev => prev - 1); 
      setActiveTab('gallery');
      addToast("Image generated and saved!", "success");
      
    } catch (error: any) {
      addToast(error.message || 'Failed to generate image', "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (e: React.MouseEvent, imageUrl: string, id: string) => {
    e.stopPropagation();
    try {
      addToast("Starting download...", "info");
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nordic-studio-${id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addToast("Download started!", "success");
    } catch (error) {
      console.error("Download failed:", error);
      addToast("Download failed. Please try again.", "error");
    }
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
        return (
          <LandingPage 
            onStart={() => setView('pricing')} 
            onLogin={() => {
              setAuthMode('login');
              setView('auth');
            }}
          />
        );

      case 'pricing':
        // Pricing leder til Auth med valgt plan
        return (
          <PricingPage 
            onSelectPlan={(plan) => {
              setPendingPlan(plan);
              setAuthMode('register'); 
              setView('auth' as ViewState); 
            }} 
            onLogin={() => {
              setAuthMode('login');
              setView('auth' as ViewState);
            }}
          />
        );

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
      case 'contact': return <ContactPage />;
      default: return null;
    }
  };

  return (
    <Layout 
      view={view} 
      setView={setView} 
      isDarkMode={isDarkMode} 
      toggleTheme={toggleTheme}
      isAuthenticated={!!currentUser}
    >
      {renderCurrentView()}
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />

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