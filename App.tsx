import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  Search, 
  Star, 
  ChevronLeft, 
  CheckCircle, 
  Banknote,
  Scissors,
  Power,
  User,
  Store,
  Lock,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  History,
  HelpCircle,
  Phone,
  Mail,
  MessageSquare,
  X,
  ChevronDown,
  AlertCircle,
  Smartphone,
  LogOut,
  Key,
  Calendar,
  CreditCard
} from 'lucide-react';

// --- Configuration & Constants ---

const CURRENCY = '₹';
const COMMISSION_RATE = 0.10; 

// --- FAQ Data ---
const CUSTOMER_FAQS = [
  { q: "How do I cancel a booking?", a: "You can cancel up to 30 minutes before the slot time from your booking history." },
  { q: "What if the shop is closed?", a: "If a shop is unexpectedly closed, please report it here. We will refund your amount immediately." },
  { q: "My payment failed but money was deducted.", a: "Don't worry! It will be auto-refunded within 24 hours." }
];

const OWNER_FAQS = [
  { q: "When can I withdraw my earnings?", a: "Funds become available immediately after the service slot time has passed (simulated in this demo)." },
  { q: "Why is my balance 'Pending'?", a: "Money is held securely until the booking service is successfully completed to ensure customer satisfaction." },
  { q: "How do I update my shop image?", a: "Please email support@firstcut.com with your shop ID and new images." }
];

const SERVICES_LIST = [
  { id: 's1', name: 'Hair Cut', price: 250, duration: 30 },
  { id: 's2', name: 'Beard Shave', price: 150, duration: 20 },
  { id: 's3', name: 'Facewash & Cleanup', price: 450, duration: 45 },
  { id: 's4', name: 'Hair Color', price: 800, duration: 60 },
  { id: 's5', name: 'Head Massage', price: 300, duration: 30 },
];

const INITIAL_SHOPS = [
  {
    id: 1,
    name: "Gentleman's Grooming",
    address: "12 Main St, Downtown",
    distance: "0.8 km",
    rating: 4.8,
    reviews: 124,
    image: "https://picsum.photos/800/600?random=1",
    isOpen: true, 
    bookedSlots: ["10:00 AM"] 
  },
  {
    id: 2,
    name: "Urban Fadez Barbershop",
    address: "45 West Avenue",
    distance: "1.2 km",
    rating: 4.5,
    reviews: 89,
    image: "https://picsum.photos/800/600?random=2",
    isOpen: true,
    bookedSlots: []
  },
  {
    id: 3,
    name: "The Classic Cut",
    address: "88 Market Square",
    distance: "2.5 km",
    rating: 4.9,
    reviews: 210,
    image: "https://picsum.photos/800/600?random=3",
    isOpen: false,
    bookedSlots: ["04:00 PM", "04:30 PM"]
  },
  {
    id: 4,
    name: "Razor's Edge",
    address: "101 Park Lane",
    distance: "3.1 km",
    rating: 4.6,
    reviews: 56,
    image: "https://picsum.photos/800/600?random=4",
    isOpen: true,
    bookedSlots: []
  }
];

const TIME_SLOTS = [
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", 
  "12:00 PM", "01:00 PM", "01:30 PM", "02:00 PM",
  "02:30 PM", "03:00 PM", "04:00 PM", "04:30 PM"
];

// --- Types ---

interface User {
  name: string;
  type: 'customer' | 'owner';
  method: 'mobile' | 'email';
  contact: string;
}

interface Shop {
  id: number;
  name: string;
  address: string;
  distance: string;
  rating: number;
  reviews: number;
  image: string;
  isOpen: boolean;
  bookedSlots: string[];
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface BookingDetails {
  shop: Shop;
  services: Service[];
  slot: string;
  subtotal: number;
  platformFee: number;
  grandTotal: number;
  shopEarnings: number;
  id: string;
}

interface Transaction {
  id: number;
  type: 'credit' | 'debit';
  amount: number;
  desc: string;
  status: 'available' | 'pending' | 'completed';
  date: string;
}

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }: any) => {
  const baseStyle = "px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:active:scale-100";
  const variants: any = {
    primary: "bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20",
    success: "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20",
    outline: "border border-slate-600 text-slate-300 hover:bg-slate-800"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }: any) => {
  const styles: any = {
    default: "bg-slate-700 text-slate-300",
    success: "bg-green-500/10 text-green-500 border border-green-500/20",
    warning: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20"
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
};

// --- Main App Component ---

export default function FirstCutApp() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [view, setView] = useState('login'); 
  const [shops, setShops] = useState<Shop[]>(INITIAL_SHOPS);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  // --- Support State ---
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpType, setHelpType] = useState<'customer' | 'owner'>('customer'); 

  // --- Wallet & Transactions State ---
  const [ownerWallet, setOwnerWallet] = useState({
    pendingBalance: 450, 
    availableBalance: 1200, 
  });

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, type: 'credit', amount: 250, desc: 'Hair Cut (Completed)', status: 'available', date: 'Today, 9:00 AM' },
    { id: 2, type: 'credit', amount: 450, desc: 'Facial (Scheduled)', status: 'pending', date: 'Today, 2:00 PM' },
  ]);

  // --- Actions ---

  const handleLogin = (userType: 'customer' | 'owner', method: 'mobile' | 'email', value: string) => {
    const newUser: User = {
      name: userType === 'owner' ? "Shop Owner" : "Alex Johnson",
      type: userType,
      method: method,
      contact: value
    };
    setCurrentUser(newUser);
    
    if (userType === 'owner') {
      setView('ownerDashboard');
    } else {
      setView('home');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
    setSelectedServices([]);
    setSelectedSlot(null);
    setSelectedShop(null);
    setSearchQuery('');
  };

  const handleShopClick = (shop: Shop) => {
    if (!shop.isOpen) {
      alert("This shop is currently closed.");
      return;
    }
    setSelectedShop(shop);
    setSelectedServices([]);
    setSelectedSlot(null);
    setView('shop');
  };

  const toggleService = (service: Service) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const calculateSubtotal = () => {
    return selectedServices.reduce((total, service) => total + service.price, 0);
  };

  const handleBooking = () => {
    if (!selectedShop || !selectedSlot) return;

    const subtotal = calculateSubtotal();
    const commissionAmount = Math.round(subtotal * COMMISSION_RATE); 
    const shopEarnings = subtotal - commissionAmount;

    setBookingDetails({
      shop: selectedShop,
      services: selectedServices,
      slot: selectedSlot,
      subtotal: subtotal,
      platformFee: commissionAmount, 
      grandTotal: subtotal,          
      shopEarnings: shopEarnings,    
      id: Math.random().toString(36).substr(2, 9).toUpperCase()
    });

    setView('payment');
  };

  const confirmPayment = () => {
    if (!bookingDetails) return;
    setIsBookingLoading(true);

    // Simulate API call
    setTimeout(() => {
      const updatedShops = shops.map(shop => {
        if (shop.id === bookingDetails.shop.id) {
          return {
            ...shop,
            bookedSlots: [...shop.bookedSlots, bookingDetails.slot]
          };
        }
        return shop;
      });
      setShops(updatedShops);

      // In a real app, this logic would happen on the backend
      // Here we simulate the owner receiving the funds
      if (bookingDetails.shop.id === 1) { // Assuming current user owns Shop 1
        setOwnerWallet(prev => ({
          ...prev,
          pendingBalance: prev.pendingBalance + bookingDetails.shopEarnings
        }));

        const newTransaction: Transaction = {
          id: Date.now(),
          type: 'credit',
          amount: bookingDetails.shopEarnings,
          desc: `Booking: ${bookingDetails.services.map(s => s.name).join(', ')}`,
          status: 'pending', 
          date: `Today, ${bookingDetails.slot}`
        };
        setTransactions(prev => [newTransaction, ...prev]);
      }
      
      setIsBookingLoading(false);
      setView('success');
    }, 1500);
  };

  const toggleShopStatus = (shopId: number) => {
    const updatedShops = shops.map(shop => {
      if (shop.id === shopId) {
        return { ...shop, isOpen: !shop.isOpen };
      }
      return shop;
    });
    setShops(updatedShops);
  };

  const simulateJobCompletion = () => {
    const pendingTxs = transactions.filter(t => t.status === 'pending');
    if (pendingTxs.length === 0) {
      alert("No pending jobs to complete.");
      return;
    }

    let releasedAmount = 0;
    const updatedTransactions = transactions.map(t => {
      if (t.status === 'pending') {
        releasedAmount += t.amount;
        return { ...t, status: 'available' as const, desc: t.desc + ' (Completed)' };
      }
      return t;
    });

    setOwnerWallet(prev => ({
      pendingBalance: 0,
      availableBalance: prev.availableBalance + prev.pendingBalance
    }));

    setTransactions(updatedTransactions);
    alert(`All pending jobs marked as complete. ${CURRENCY}${releasedAmount} moved to Available Balance.`);
  };

  const handleWithdrawal = () => {
    if (ownerWallet.availableBalance <= 0) {
      alert("No available balance to withdraw.");
      return;
    }
    const amount = ownerWallet.availableBalance;
    
    const withdrawalTx: Transaction = {
      id: Date.now(),
      type: 'debit',
      amount: amount,
      desc: 'Withdrawal to Bank Account (**** 1234)',
      status: 'completed',
      date: 'Just Now'
    };

    setTransactions([withdrawalTx, ...transactions]);
    setOwnerWallet(prev => ({
      ...prev,
      availableBalance: 0
    }));

    alert(`Successfully withdrew ${CURRENCY}${amount} to your bank account.`);
  };

  // --- Support Actions ---

  const openSupport = (type: 'customer' | 'owner') => {
    setHelpType(type);
    setIsHelpOpen(true);
  };

  // --- Views ---

  const AuthView = () => {
    const [loginRole, setLoginRole] = useState<'customer' | 'owner'>('customer'); 
    const [loginMethod, setLoginMethod] = useState<'mobile' | 'email'>('mobile'); 
    const [inputValue, setInputValue] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(!inputValue || !password) {
        alert("Please fill in all fields");
        return;
      }
      handleLogin(loginRole, loginMethod, inputValue);
    }

    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="w-full max-w-sm z-10">
          <div className="flex justify-center mb-8">
            <div className="bg-slate-800 p-4 rounded-full border border-slate-700 shadow-xl ring-1 ring-slate-700/50">
              <Scissors className="w-10 h-10 text-amber-500" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">First Cut</h1>
            <p className="text-slate-400">Login to continue</p>
          </div>

          {/* Role Toggle */}
          <div className="bg-slate-800 p-1 rounded-xl flex mb-6 border border-slate-700">
            <button 
              onClick={() => setLoginRole('customer')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginRole === 'customer' ? 'bg-amber-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Customer
            </button>
            <button 
              onClick={() => setLoginRole('owner')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginRole === 'owner' ? 'bg-amber-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Partner (Owner)
            </button>
          </div>

          <Card className="p-6 shadow-2xl bg-slate-800/80 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Login Method Toggle */}
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${loginMethod === 'mobile' ? 'border-amber-500' : 'border-slate-500'}`}>
                    {loginMethod === 'mobile' && <div className="w-2 h-2 bg-amber-500 rounded-full"></div>}
                  </div>
                  <input type="radio" className="hidden" checked={loginMethod === 'mobile'} onChange={() => setLoginMethod('mobile')} />
                  <span className={`text-sm ${loginMethod === 'mobile' ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>Mobile Number</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${loginMethod === 'email' ? 'border-amber-500' : 'border-slate-500'}`}>
                     {loginMethod === 'email' && <div className="w-2 h-2 bg-amber-500 rounded-full"></div>}
                  </div>
                  <input type="radio" className="hidden" checked={loginMethod === 'email'} onChange={() => setLoginMethod('email')} />
                  <span className={`text-sm ${loginMethod === 'email' ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>Email ID</span>
                </label>
              </div>

              {/* Input Fields */}
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute left-3 top-3.5 text-slate-500">
                    {loginMethod === 'mobile' ? <Smartphone className="w-5 h-5"/> : <Mail className="w-5 h-5"/>}
                  </div>
                  <input 
                    type={loginMethod === 'mobile' ? "tel" : "email"} 
                    placeholder={loginMethod === 'mobile' ? "Enter Mobile Number" : "Enter Email Address"}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-3.5 text-slate-500">
                    <Key className="w-5 h-5"/>
                  </div>
                  <input 
                    type="password" 
                    placeholder="Password"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button className="w-full mt-2" onClick={handleSubmit}>
                Login as {loginRole === 'customer' ? 'Customer' : 'Owner'}
              </Button>
            </form>
          </Card>
          
          <p className="text-center text-slate-500 text-sm mt-6">
            Don't have an account? <span className="text-amber-500 font-bold cursor-pointer hover:underline">Sign Up</span>
          </p>
        </div>
      </div>
    );
  };

  const HelpModal = () => {
    if (!isHelpOpen) return null;

    const faqData = helpType === 'owner' ? OWNER_FAQS : CUSTOMER_FAQS;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsHelpOpen(false)}
        ></div>
        
        {/* Modal Content */}
        <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 relative z-10 shadow-2xl animate-in fade-in zoom-in duration-200">
          
          <button 
            onClick={() => setIsHelpOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {helpType === 'owner' ? 'Owner Help Desk' : 'Customer Support'}
              </h2>
              <p className="text-xs text-slate-400">We are here to help you 24/7</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl flex flex-col items-center gap-2 border border-slate-700 transition-colors group">
              <Phone className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
              <span className="text-white text-sm font-medium">Call Us</span>
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl flex flex-col items-center gap-2 border border-slate-700 transition-colors group">
              <Mail className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-white text-sm font-medium">Email</span>
            </button>
          </div>

          {/* FAQs */}
          <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider text-slate-500">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3 mb-6">
            {faqData.map((item, idx) => (
              <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-800">
                <p className="text-amber-500 font-medium text-sm mb-1">{item.q}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          {/* Report Issue Button */}
          <Button variant="outline" className="w-full">
            <AlertCircle className="w-4 h-4" />
            {helpType === 'owner' ? 'Report Technical Issue' : 'Report a Problem'}
          </Button>

        </div>
      </div>
    );
  };

  const HomeView = () => {
    const filteredShops = shops.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="space-y-6 pb-20">
        <div className="bg-slate-900 pt-6 pb-2 px-6 flex items-center justify-between relative z-20">
            <div className="flex items-center gap-3">
              <Scissors className="w-8 h-8 text-amber-500 transform -rotate-12 drop-shadow-lg" />
              <h1 className="text-3xl font-extrabold italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">
                First Cut
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => openSupport('customer')}
                className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button onClick={handleLogout} className="p-2 bg-slate-800 rounded-full text-red-400 hover:bg-slate-700 border border-slate-700 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
        </div>

        <div className="relative h-64 rounded-t-3xl rounded-b-3xl overflow-hidden bg-slate-800 -mt-4 mx-2 border border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=1000" 
            alt="Barber" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute bottom-6 left-6 z-20">
            <p className="text-amber-500 font-semibold mb-1 uppercase tracking-wider text-xs">Premium Grooming</p>
            <h2 className="text-3xl font-bold text-white leading-none mb-2">Look Sharp.<br/>Feel Sharp.</h2>
            <p className="text-slate-300 text-sm max-w-xs">Book the best barbers in your city with just a tap.</p>
          </div>
        </div>

        <div className="px-6 -mt-8 relative z-20">
          <div className="bg-slate-800 p-2 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-500 ml-2" />
            <input 
              type="text" 
              placeholder="Search for 'Haircut', 'Salon'..." 
              className="bg-transparent w-full text-white placeholder-slate-500 focus:outline-none p-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="px-6">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-bold text-white">Popular Shops</h3>
            <span className="text-amber-500 text-sm font-medium cursor-pointer">View All</span>
          </div>

          <div className="grid gap-6">
            {filteredShops.map(shop => (
              <Card key={shop.id} className="group cursor-pointer hover:border-amber-500/50 transition-all">
                <div onClick={() => handleShopClick(shop)}>
                  <div className="relative h-40">
                    <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3">
                      {shop.isOpen ? (
                        <Badge variant="success">OPEN</Badge>
                      ) : (
                        <Badge variant="danger">CLOSED</Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold text-white group-hover:text-amber-500 transition-colors">{shop.name}</h4>
                      <div className="flex items-center gap-1 bg-slate-700 px-2 py-1 rounded text-xs text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{shop.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{shop.distance}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{shop.reviews} reviews</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 truncate">{shop.address}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const ShopDetailView = () => {
    if (!selectedShop) return null;

    return (
      <div className="min-h-screen bg-slate-900 pb-24">
        {/* Header Image */}
        <div className="relative h-64">
          <img src={selectedShop.image} alt={selectedShop.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
          <button 
            onClick={() => setView('home')}
            className="absolute top-6 left-6 p-2 bg-slate-800/80 backdrop-blur rounded-full text-white hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 -mt-12 relative">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{selectedShop.name}</h1>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <MapPin className="w-4 h-4 text-amber-500" />
                {selectedShop.address}
              </div>
            </div>
            <div className="bg-amber-500 px-3 py-1 rounded-lg text-black font-bold flex flex-col items-center">
              <span className="text-xs font-medium uppercase opacity-80">Rating</span>
              <div className="flex items-center gap-1">
                <span>{selectedShop.rating}</span>
                <Star className="w-3 h-3 fill-current" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              Select Services
            </h3>
            <div className="space-y-3">
              {SERVICES_LIST.map(service => {
                const isSelected = selectedServices.some(s => s.id === service.id);
                return (
                  <div 
                    key={service.id}
                    onClick={() => toggleService(service)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-amber-500/10 border-amber-500' : 'bg-slate-700/30 border-slate-700 hover:border-slate-600'}`}
                  >
                    <div>
                      <p className={`font-medium ${isSelected ? 'text-amber-500' : 'text-white'}`}>{service.name}</p>
                      <p className="text-xs text-slate-400">{service.duration} mins</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-white font-bold">{CURRENCY}{service.price}</p>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-amber-500 border-amber-500' : 'border-slate-500'}`}>
                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-black" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Select Time Slot
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map(slot => {
                const isBooked = selectedShop.bookedSlots.includes(slot);
                const isSelected = selectedSlot === slot;
                
                return (
                  <button
                    key={slot}
                    disabled={isBooked}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-1 text-xs rounded-lg font-medium border transition-all 
                      ${isBooked 
                        ? 'bg-slate-700/50 text-slate-500 border-transparent cursor-not-allowed decoration-slate-500 line-through' 
                        : isSelected 
                          ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20' 
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-4 pb-8 z-30">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Total</p>
              <p className="text-2xl font-bold text-white">{CURRENCY}{calculateSubtotal()}</p>
            </div>
            <Button 
              onClick={handleBooking} 
              disabled={selectedServices.length === 0 || !selectedSlot}
              className="flex-1"
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const PaymentView = () => {
    if (!bookingDetails) return null;

    return (
      <div className="min-h-screen bg-slate-900 flex flex-col p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView('shop')} className="p-2 bg-slate-800 rounded-full text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">Payment Summary</h1>
        </div>

        <div className="flex-1 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-white mb-4">Booking Details</h2>
            <div className="space-y-4">
              <div className="flex gap-4 border-b border-slate-700 pb-4">
                <img src={bookingDetails.shop.image} className="w-16 h-16 rounded-lg object-cover" alt="shop" />
                <div>
                  <h3 className="font-semibold text-white">{bookingDetails.shop.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-slate-400 mt-1">
                    <MapPin className="w-3 h-3" /> {bookingDetails.shop.address}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-400 mt-1">
                    <Clock className="w-3 h-3" /> Today, {bookingDetails.slot}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-2">Selected Services</h4>
                {bookingDetails.services.map(s => (
                  <div key={s.id} className="flex justify-between text-sm text-slate-300 mb-1">
                    <span>{s.name}</span>
                    <span>{CURRENCY}{s.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-white mb-4">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>{CURRENCY}{bookingDetails.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Platform Fee (10%)</span>
                <span>{CURRENCY}{bookingDetails.platformFee}</span>
              </div>
              <div className="border-t border-slate-700 my-2 pt-2 flex justify-between text-white font-bold text-lg">
                <span>Total Amount</span>
                <span>{CURRENCY}{bookingDetails.grandTotal}</span>
              </div>
            </div>
          </Card>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200">
              Free cancellation up to 30 mins before the scheduled time. Refunds are processed automatically to your source account.
            </p>
          </div>
        </div>

        <Button onClick={confirmPayment} disabled={isBookingLoading} className="w-full mt-4">
          {isBookingLoading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Pay {CURRENCY}{bookingDetails.grandTotal}
            </>
          )}
        </Button>
      </div>
    );
  };

  const SuccessView = () => (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/40 animate-bounce">
        <CheckCircle className="w-12 h-12 text-black" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
      <p className="text-slate-400 mb-8 max-w-xs mx-auto">
        Your appointment with <span className="text-amber-500">{bookingDetails?.shop.name}</span> is set for <span className="text-white font-bold">{bookingDetails?.slot}</span>.
      </p>
      
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 w-full max-w-xs mb-8">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Booking ID</p>
        <p className="text-xl font-mono text-white tracking-widest">{bookingDetails?.id}</p>
      </div>

      <div className="flex flex-col w-full gap-3 max-w-xs">
        <Button onClick={() => setView('home')}>Go to Home</Button>
      </div>
    </div>
  );

  const OwnerDashboard = () => {
    // Assuming shop ID 1 is the owner's shop
    const myShop = shops.find(s => s.id === 1); 

    return (
      <div className="min-h-screen bg-slate-900 text-white pb-20">
        <div className="bg-slate-800 p-6 rounded-b-3xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-black font-bold text-xl">
                {myShop?.name.charAt(0)}
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">{myShop?.name}</h1>
                <p className="text-xs text-slate-400">Partner Dashboard</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => openSupport('owner')}
                className="p-2 bg-slate-700 rounded-full text-slate-400 hover:text-white"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button onClick={handleLogout} className="p-2 bg-slate-700 rounded-full text-red-400 hover:bg-slate-600">
                <Power className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
              <p className="text-slate-400 text-xs uppercase mb-1">Available</p>
              <p className="text-2xl font-bold text-white">{CURRENCY}{ownerWallet.availableBalance}</p>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
              <p className="text-slate-400 text-xs uppercase mb-1">Pending</p>
              <p className="text-2xl font-bold text-amber-500">{CURRENCY}{ownerWallet.pendingBalance}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3">
              <Store className={`w-5 h-5 ${myShop?.isOpen ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-sm font-medium">{myShop?.isOpen ? 'Shop is Online' : 'Shop is Offline'}</span>
            </div>
            <div 
              onClick={() => toggleShopStatus(1)}
              className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${myShop?.isOpen ? 'bg-green-500' : 'bg-slate-600'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${myShop?.isOpen ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
             <Button variant="secondary" onClick={simulateJobCompletion} className="text-xs h-auto py-4 flex-col gap-2">
               <CheckCircle className="w-6 h-6 text-green-500" />
               Complete Jobs
             </Button>
             <Button variant="secondary" onClick={handleWithdrawal} className="text-xs h-auto py-4 flex-col gap-2">
               <Banknote className="w-6 h-6 text-blue-500" />
               Withdraw Funds
             </Button>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" />
              Recent Transactions
            </h3>
            <div className="space-y-4">
              {transactions.length === 0 && <p className="text-slate-500 text-sm">No transactions yet.</p>}
              {transactions.map(tx => (
                <div key={tx.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5 text-green-500" /> : <ArrowUpRight className="w-5 h-5 text-red-500" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">{tx.desc}</p>
                      <p className="text-xs text-slate-500">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'credit' ? 'text-green-500' : 'text-white'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{CURRENCY}{tx.amount}
                    </p>
                    <Badge variant={tx.status === 'completed' || tx.status === 'available' ? 'success' : 'warning'}>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {view === 'login' && <AuthView />}
      {view === 'home' && <HomeView />}
      {view === 'shop' && <ShopDetailView />}
      {view === 'payment' && <PaymentView />}
      {view === 'success' && <SuccessView />}
      {view === 'ownerDashboard' && <OwnerDashboard />}
      
      <HelpModal />
    </>
  );
}