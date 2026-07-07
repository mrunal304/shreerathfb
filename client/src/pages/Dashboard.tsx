import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFeedback, useMarkContacted } from "@/hooks/use-feedback";
import { useAnalytics } from "@/hooks/use-analytics";
import { useLogout, useUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatsCard } from "@/components/StatsCard";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  LineChart, Line, Cell, Tooltip as RechartsTooltip 
} from "recharts";
import { format, subDays, startOfToday, startOfYesterday } from "date-fns";
import { 
  LayoutDashboard, LogOut, Search, Star, TrendingUp, Phone, Eye, Menu, X, CheckCircle2, MessageSquare, Calendar as CalendarIcon, ChevronUp, ChevronDown
} from "lucide-react";
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const COLORS = ['#FF4500', '#228B22', '#FFBB28', '#FF8042', '#8B4513'];
const LineChartTooltip = RechartsTooltip;
const BarChartTooltip = RechartsTooltip;

export default function Dashboard() {
  const { data: user, isLoading: userLoading } = useUser();
  const [, setLocation] = useLocation();
  const logout = useLogout();
  const [activeTab, setActiveTab] = useState<'overview' | 'feedback'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  if (userLoading) return null;
  if (!user) {
    setLocation("/admin/login");
    return null;
  }

  const navItems = (
    <>
      <Button 
        variant={activeTab === 'overview' ? 'secondary' : 'ghost'} 
        className={`w-full justify-start ${activeTab === 'overview' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
        onClick={() => {
          setActiveTab('overview');
          setIsSidebarOpen(false);
        }}
      >
        <LayoutDashboard className="mr-2 h-5 w-5" />
        Overview
      </Button>
      <Button 
        variant={activeTab === 'feedback' ? 'secondary' : 'ghost'} 
        className={`w-full justify-start ${activeTab === 'feedback' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
        onClick={() => {
          setActiveTab('feedback');
          setIsSidebarOpen(false);
        }}
      >
        <MessageSquare className="mr-2 h-5 w-5" />
        Feedback
      </Button>
    </>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold font-display">Admin Panel</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-white/70 hover:text-white hover:bg-white/5"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Avatar className="h-8 w-8 bg-primary text-white border border-white/20">
            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.username}</p>
            <p className="text-xs text-white/50 truncate capitalize">{user.role}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-300 hover:text-red-200 hover:bg-red-500/10"
          onClick={() => logout.mutate()}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5DC]/50 flex relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-secondary text-white transform transition-transform duration-300 ease-in-out shadow-2xl
        md:relative md:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 md:py-8 md:px-4 min-h-screen overflow-y-auto w-full">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-secondary"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h2 className="text-2xl font-bold font-display text-secondary md:hidden">Admin Panel</h2>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => logout.mutate()}>
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        {activeTab === 'overview' ? <OverviewTab /> : <FeedbackTab />}
      </main>
    </div>
  );
}

function OverviewTab() {
  type OverviewFilter = 'today' | 'last7' | 'this_month' | 'last_month' | 'select_month' | 'custom_range';
  const [activeFilter, setActiveFilter] = useState<OverviewFilter>('last7');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [showSubPicker, setShowSubPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const CUR_YEAR = new Date().getFullYear();
  const YEARS = [CUR_YEAR - 2, CUR_YEAR - 1, CUR_YEAR];

  const filterParams = useMemo(() => {
    const now = new Date();
    const todayStr = format(startOfToday(), 'yyyy-MM-dd');
    switch (activeFilter) {
      case 'today':
        return { dateFrom: todayStr, dateTo: todayStr };
      case 'last7':
        return { dateFrom: format(subDays(startOfToday(), 6), 'yyyy-MM-dd'), dateTo: todayStr };
      case 'this_month':
        return {
          dateFrom: format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd'),
          dateTo: todayStr,
        };
      case 'last_month':
        return {
          dateFrom: format(new Date(now.getFullYear(), now.getMonth() - 1, 1), 'yyyy-MM-dd'),
          dateTo: format(new Date(now.getFullYear(), now.getMonth(), 0), 'yyyy-MM-dd'),
        };
      case 'select_month':
        return {
          dateFrom: format(new Date(selectedYear, selectedMonth, 1), 'yyyy-MM-dd'),
          dateTo: format(new Date(selectedYear, selectedMonth + 1, 0), 'yyyy-MM-dd'),
        };
      case 'custom_range':
        return (rangeFrom && rangeTo)
          ? { dateFrom: rangeFrom, dateTo: rangeTo }
          : { dateFrom: format(subDays(startOfToday(), 6), 'yyyy-MM-dd'), dateTo: todayStr };
      default:
        return { dateFrom: format(subDays(startOfToday(), 6), 'yyyy-MM-dd'), dateTo: todayStr };
    }
  }, [activeFilter, selectedMonth, selectedYear, rangeFrom, rangeTo]);

  const activeLabel = useMemo(() => {
    const now = new Date();
    switch (activeFilter) {
      case 'today':        return 'Today';
      case 'last7':        return 'Last 7 Days';
      case 'this_month':   return format(now, 'MMMM yyyy');
      case 'last_month':   return format(new Date(now.getFullYear(), now.getMonth() - 1, 1), 'MMMM yyyy');
      case 'select_month': return format(new Date(selectedYear, selectedMonth, 1), 'MMMM yyyy');
      case 'custom_range':
        return (rangeFrom && rangeTo)
          ? `${format(new Date(rangeFrom + 'T00:00:00'), 'dd MMM')} – ${format(new Date(rangeTo + 'T00:00:00'), 'dd MMM')}`
          : 'Custom Range';
      default: return 'Last 7 Days';
    }
  }, [activeFilter, selectedMonth, selectedYear, rangeFrom, rangeTo]);

  const { data: analytics, isLoading } = useAnalytics(filterParams);

  const filterOptions: { value: OverviewFilter; label: string }[] = [
    { value: 'today',        label: 'Today' },
    { value: 'last7',        label: 'Last 7 Days' },
    { value: 'this_month',   label: 'This Month' },
    { value: 'last_month',   label: 'Last Month' },
    { value: 'select_month', label: 'Select Month ›' },
    { value: 'custom_range', label: 'Custom Range ›' },
  ];

  if (isLoading) return <div className="flex justify-center p-12"><div className="animate-spin text-primary">Loading...</div></div>;
  if (!analytics) return <div>No data available</div>;

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary font-display">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back, here's what's happening today.</p>
        </div>
        {/* Filter dropdown button */}
        <button
          onClick={() => { setFilterPanelOpen(p => !p); setShowSubPicker(false); }}
          className="flex items-center gap-2 text-sm font-medium bg-white px-4 py-2 rounded-full shadow-sm text-secondary hover:bg-secondary/5 transition-colors border border-border/50"
        >
          {activeLabel}
          {filterPanelOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Filter option panel */}
      {filterPanelOpen && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase mr-1">Period:</span>
          {filterOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => {
                setActiveFilter(value);
                setFilterPanelOpen(false);
                setShowSubPicker(value === 'select_month' || value === 'custom_range');
              }}
              className={`h-9 px-4 rounded-full text-sm font-medium border transition-colors ${
                activeFilter === value
                  ? 'bg-secondary text-white border-secondary'
                  : 'border-secondary text-secondary hover:bg-secondary/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Sub-picker: Select Month */}
      {showSubPicker && !filterPanelOpen && activeFilter === 'select_month' && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Pick Month:</span>
          {/* Year first — stays open. Month last — auto-closes and applies both. */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="h-10 rounded-xl bg-secondary/5 border-none px-3 text-sm font-medium text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(Number(e.target.value));
              setShowSubPicker(false);  // Auto-close and apply once month is picked
            }}
            className="h-10 rounded-xl bg-secondary/5 border-none px-3 text-sm font-medium text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <button
            type="button"
            onClick={() => setShowSubPicker(false)}
            className="h-9 px-4 rounded-full text-sm font-medium border border-secondary text-secondary hover:bg-secondary/5 transition-colors"
          >
            Done
          </button>
        </div>
      )}

      {/* Sub-picker: Custom Range */}
      {showSubPicker && !filterPanelOpen && activeFilter === 'custom_range' && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Date Range:</span>
          <Input
            type="date"
            value={rangeFrom}
            onChange={(e) => { setRangeFrom(e.target.value); if (e.target.value && rangeTo) setShowSubPicker(false); }}
            className="h-10 w-[150px] rounded-xl border-none bg-secondary/5 font-medium focus-visible:ring-primary text-sm"
          />
          <span className="text-muted-foreground text-sm font-medium">→</span>
          <Input
            type="date"
            value={rangeTo}
            onChange={(e) => { setRangeTo(e.target.value); if (rangeFrom && e.target.value) setShowSubPicker(false); }}
            className="h-10 w-[150px] rounded-xl border-none bg-secondary/5 font-medium focus-visible:ring-primary text-sm"
          />
          {!(rangeFrom && rangeTo) && (
            <button
              onClick={() => setShowSubPicker(false)}
              className="h-9 px-4 rounded-full text-sm font-medium border border-secondary text-secondary hover:bg-secondary/5 transition-colors"
            >
              Done
            </button>
          )}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Feedback" 
          value={analytics.totalFeedback} 
          icon={MessageSquare}
          description="+12% from last week"
          trend="up"
        />
        <StatsCard 
          title="Average Rating" 
          value={analytics.averageRating.toFixed(1)} 
          icon={Star}
          description="Consistent excellence"
          trend="neutral"
        />
        <StatsCard 
          title="Response Rate" 
          value={`${analytics.responseRate}%`} 
          icon={CheckCircle2}
          description="Feedback acknowledged"
          trend="up"
        />
        <StatsCard 
          title="Top Category" 
          value={analytics.topCategory} 
          icon={TrendingUp}
          description="Highest rated metric"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Trends chart */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-border/50">
          <h3 className="text-lg font-semibold text-secondary mb-4">Rating Trends</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="date" stroke="#8B4513" fontSize={12} tickFormatter={(val) => format(new Date(val), 'dd MMM')} />
                <YAxis domain={[0, 5]} stroke="#8B4513" fontSize={12} />
                <LineChartTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="foodQuality" stroke="#FF4500" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="serviceSpeed" stroke="#228B22" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ambience" stroke="#8B4513" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FF4500]" /> Food Quality</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#228B22]" /> Service Speed</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#8B4513]" /> Ambience</span>
          </div>
        </div>

        {/* Category Performance chart */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-border/50">
          <h3 className="text-lg font-semibold text-secondary mb-4">Category Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.categoryPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e5e5" />
                <XAxis type="number" domain={[0, 5]} hide />
                <YAxis dataKey="category" type="category" width={80} stroke="#8B4513" fontSize={12} />
                <BarChartTooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="rating" radius={[0, 4, 4, 0]}>
                  {analytics.categoryPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.rating > 4 ? '#228B22' : entry.rating > 3 ? '#FFBB28' : '#FF4500'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  type QuickFilter = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_month' | 'select_month' | 'custom_range' | 'single_date';
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('today');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [rangeFrom, setRangeFrom] = useState<string>('');
  const [rangeTo, setRangeTo] = useState<string>('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [showSubPicker, setShowSubPicker] = useState(false);

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const CUR_YEAR = new Date().getFullYear();
  const YEARS = [CUR_YEAR - 2, CUR_YEAR - 1, CUR_YEAR];

  const filterParams = useMemo(() => {
    const todayStr = format(startOfToday(), 'yyyy-MM-dd');
    const now = new Date();
    switch (quickFilter) {
      case 'single_date': return { date: format(selectedDate, 'yyyy-MM-dd') };
      case 'today':       return { date: todayStr };
      case 'yesterday':   return { date: format(startOfYesterday(), 'yyyy-MM-dd') };
      case 'this_week': {
        const day = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
        return { dateFrom: format(monday, 'yyyy-MM-dd'), dateTo: todayStr };
      }
      case 'this_month':
        return {
          dateFrom: format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd'),
          dateTo: todayStr,
        };
      case 'last_month':
        return {
          dateFrom: format(new Date(now.getFullYear(), now.getMonth() - 1, 1), 'yyyy-MM-dd'),
          dateTo: format(new Date(now.getFullYear(), now.getMonth(), 0), 'yyyy-MM-dd'),
        };
      case 'select_month':
        return {
          dateFrom: format(new Date(selectedYear, selectedMonth, 1), 'yyyy-MM-dd'),
          dateTo: format(new Date(selectedYear, selectedMonth + 1, 0), 'yyyy-MM-dd'),
        };
      case 'custom_range':
        return (rangeFrom && rangeTo) ? { dateFrom: rangeFrom, dateTo: rangeTo } : {};
      default:
        return { date: todayStr };
    }
  }, [quickFilter, selectedDate, selectedMonth, selectedYear, rangeFrom, rangeTo]);

  const showingLabel = useMemo(() => {
    const now = new Date();
    switch (quickFilter) {
      case 'single_date': return format(selectedDate, 'dd MMM yyyy');
      case 'today':       return `Today, ${format(startOfToday(), 'dd MMM yyyy')}`;
      case 'yesterday':   return `Yesterday, ${format(startOfYesterday(), 'dd MMM yyyy')}`;
      case 'this_week':   return 'This Week';
      case 'this_month':  return format(now, 'MMMM yyyy');
      case 'last_month':  return format(new Date(now.getFullYear(), now.getMonth() - 1, 1), 'MMMM yyyy');
      case 'select_month': return format(new Date(selectedYear, selectedMonth, 1), 'MMMM yyyy');
      case 'custom_range':
        if (rangeFrom && rangeTo)
          return `${format(new Date(rangeFrom + 'T00:00:00'), 'dd MMM yyyy')} – ${format(new Date(rangeTo + 'T00:00:00'), 'dd MMM yyyy')}`;
        return 'Select date range';
      default: return '';
    }
  }, [quickFilter, selectedDate, selectedMonth, selectedYear, rangeFrom, rangeTo]);

  // dateKey used when marking a customer as contacted
  const activeContactDateKey =
    quickFilter === 'single_date' ? format(selectedDate, 'yyyy-MM-dd') :
    quickFilter === 'yesterday'   ? format(startOfYesterday(), 'yyyy-MM-dd') :
                                    format(startOfToday(), 'yyyy-MM-dd');

  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useFeedback({ 
    page, 
    limit: 10, 
    search,
    ...filterParams,
  });
  const markContacted = useMarkContacted();
  const { toast } = useToast();

  const handleRefresh = () => {
    refetch();
    toast({ title: "Refreshing", description: "Fetching latest feedback from database..." });
  };

  const handleMarkContacted = (id: string) => {
    const staffName = "Admin";
    markContacted.mutate({ id, data: { contactedBy: staffName, dateKey: activeContactDateKey } }, {
      onSuccess: () => {
        toast({ title: "Updated", description: "Customer marked as contacted" });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Could not update status" });
      }
    });
  };

  return (
    <div className="space-y-6 page-transition">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-secondary font-display">Customer Feedback</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isFetching}
            className="rounded-xl bg-white border-none shadow-sm hover:bg-secondary/5"
            title="Refresh Data"
          >
            <TrendingUp className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search name or phone..." 
              className="pl-9 h-10 rounded-xl bg-white border-none shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50">
        {/* Main filter row */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2">
            {/* Label */}
            <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Filter by Date:</span>

            {/* Single date picker — native browser calendar icon hidden to avoid duplicate */}
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary pointer-events-none" />
              <Input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(new Date(e.target.value + 'T00:00:00'));
                    setQuickFilter('single_date');
                    setFilterPanelOpen(false);
                    setShowSubPicker(false);
                    setPage(1);
                  }
                }}
                className="pl-9 h-10 w-[160px] rounded-xl border-none bg-secondary/5 font-medium focus-visible:ring-primary [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
              />
            </div>

            {/* Today pill */}
            <button
              onClick={() => { setQuickFilter('today'); setFilterPanelOpen(false); setShowSubPicker(false); setPage(1); }}
              className={`h-9 px-4 rounded-full text-sm font-medium border transition-colors ${
                quickFilter === 'today'
                  ? 'bg-secondary text-white border-secondary'
                  : 'border-secondary text-secondary hover:bg-secondary/5'
              }`}
            >
              Today
            </button>

            {/* Yesterday pill */}
            <button
              onClick={() => { setQuickFilter('yesterday'); setFilterPanelOpen(false); setShowSubPicker(false); setPage(1); }}
              className={`h-9 px-4 rounded-full text-sm font-medium border transition-colors ${
                quickFilter === 'yesterday'
                  ? 'bg-secondary text-white border-secondary'
                  : 'border-secondary text-secondary hover:bg-secondary/5'
              }`}
            >
              Yesterday
            </button>

            {/* Active panel filter pill — shown inline when a range filter is selected */}
            {(['this_week', 'this_month', 'last_month', 'select_month', 'custom_range'] as QuickFilter[]).includes(quickFilter) && (
              <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-medium bg-secondary text-white border border-secondary">
                {quickFilter === 'this_week' && 'This Week'}
                {quickFilter === 'this_month' && 'This Month'}
                {quickFilter === 'last_month' && 'Last Month'}
                {quickFilter === 'select_month' && format(new Date(selectedYear, selectedMonth, 1), 'MMM yyyy')}
                {quickFilter === 'custom_range' && (
                  rangeFrom && rangeTo
                    ? `${format(new Date(rangeFrom + 'T00:00:00'), 'dd MMM')} – ${format(new Date(rangeTo + 'T00:00:00'), 'dd MMM')}`
                    : 'Custom Range'
                )}
                <button
                  onClick={() => {
                    setQuickFilter('today');
                    setFilterPanelOpen(false);
                    setShowSubPicker(false);
                    setRangeFrom('');
                    setRangeTo('');
                    setPage(1);
                  }}
                  className="hover:text-white/70 transition-colors ml-0.5"
                  title="Clear filter"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}

            {/* Arrow toggle — expand/collapse more filter options */}
            <button
              onClick={() => { setFilterPanelOpen(prev => !prev); setShowSubPicker(false); }}
              title="More filter options"
              className={`h-9 w-9 rounded-full flex items-center justify-center border transition-colors ${
                filterPanelOpen
                  ? 'bg-secondary text-white border-secondary'
                  : 'border-secondary text-secondary hover:bg-secondary/5'
              }`}
            >
              {filterPanelOpen
                ? <ChevronUp className="h-4 w-4" />
                : <ChevronDown className="h-4 w-4" />
              }
            </button>
          </div>

          {/* Showing label */}
          <div className="text-sm font-medium text-secondary bg-secondary/5 px-4 py-2 rounded-xl shrink-0">
            Showing feedback for: <span className="text-primary font-bold">{showingLabel}</span>
          </div>
        </div>

        {/* Expanded panel — pick a range filter; collapses on selection */}
        {filterPanelOpen && (
          <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center gap-2">
            {(['this_week', 'this_month', 'last_month', 'select_month', 'custom_range'] as QuickFilter[]).map((f) => {
              const labels: Record<string, string> = {
                this_week: 'This Week',
                this_month: 'This Month',
                last_month: 'Last Month',
                select_month: 'Select Month ›',
                custom_range: 'Custom Range ›',
              };
              return (
                <button
                  key={f}
                  onClick={() => {
                    setQuickFilter(f);
                    setPage(1);
                    setFilterPanelOpen(false);
                    // select_month and custom_range open a sub-picker instead
                    setShowSubPicker(f === 'select_month' || f === 'custom_range');
                  }}
                  className={`h-9 px-4 rounded-full text-sm font-medium border transition-colors ${
                    quickFilter === f
                      ? 'bg-secondary text-white border-secondary'
                      : 'border-secondary text-secondary hover:bg-secondary/5'
                  }`}
                >
                  {labels[f]}
                </button>
              );
            })}
          </div>
        )}

        {/* Sub-picker: Select Month — appears below filter bar after selecting "Select Month ›" */}
        {showSubPicker && !filterPanelOpen && quickFilter === 'select_month' && (
          <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Pick Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => { setSelectedMonth(Number(e.target.value)); setPage(1); }}
              className="h-10 rounded-xl bg-secondary/5 border-none px-3 text-sm font-medium text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(Number(e.target.value)); setPage(1); }}
              className="h-10 rounded-xl bg-secondary/5 border-none px-3 text-sm font-medium text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button
              type="button"
              onClick={() => setShowSubPicker(false)}
              className="h-9 px-4 rounded-full text-sm font-medium border border-secondary text-secondary hover:bg-secondary/5 transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {/* Sub-picker: Custom Range — appears below filter bar after selecting "Custom Range ›" */}
        {showSubPicker && !filterPanelOpen && quickFilter === 'custom_range' && (
          <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Date Range:</span>
            <Input
              type="date"
              value={rangeFrom}
              onChange={(e) => { setRangeFrom(e.target.value); setPage(1); if (e.target.value && rangeTo) setShowSubPicker(false); }}
              className="h-10 w-[150px] rounded-xl border-none bg-secondary/5 font-medium focus-visible:ring-primary text-sm"
            />
            <span className="text-muted-foreground text-sm font-medium">→</span>
            <Input
              type="date"
              value={rangeTo}
              onChange={(e) => {
                setRangeTo(e.target.value);
                setPage(1);
                // auto-close once both dates are filled
                if (rangeFrom && e.target.value) setShowSubPicker(false);
              }}
              className="h-10 w-[150px] rounded-xl border-none bg-secondary/5 font-medium focus-visible:ring-primary text-sm"
            />
            {!(rangeFrom && rangeTo) && (
              <button
                type="button"
                onClick={() => setShowSubPicker(false)}
                className="h-9 px-4 rounded-full text-sm font-medium border border-secondary text-secondary hover:bg-secondary/5 transition-colors"
              >
                Done
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/5">
            <TableRow className="hover:bg-transparent border-b border-secondary/10">
              <TableHead className="w-[180px] font-semibold text-secondary">Customer</TableHead>
              <TableHead className="w-[150px] font-semibold text-secondary">Visit Info</TableHead>
              <TableHead className="font-semibold text-secondary">Ratings</TableHead>
              <TableHead className="hidden md:table-cell font-semibold text-secondary">Note</TableHead>
              <TableHead className="font-semibold text-secondary w-[92px]">Date</TableHead>
              <TableHead className="font-semibold text-secondary">Status</TableHead>
              <TableHead className="text-right font-semibold text-secondary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : !data || data.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">No feedback found for this date.</TableCell>
              </TableRow>
            ) : (
              data.data.map((item) => {
                const visits = (item as any).visits || [];
                const latestVisit = visits[visits.length - 1] as any;
                const rawGVN = latestVisit?.globalVisitNumber;
                const visitNumber = rawGVN ? Number(rawGVN) : 1;
                const getOrdinal = (n: number) => {
                  if (n === 1) return "1st Visit";
                  if (n === 2) return "2nd Visit";
                  if (n === 3) return "3rd Visit";
                  return `${n}th Visit`;
                };

                const avgRating = latestVisit ? ((Object.values(latestVisit.ratings) as number[]).reduce((a: number, b: number) => a + b, 0) / 6).toFixed(1) : "0.0";
                const isContacted = ['single_date', 'today', 'yesterday'].includes(quickFilter)
                  ? !!(item.contactedAt && item.contactedDateKey === activeContactDateKey)
                  : !!item.contactedAt;

                return (
                  <TableRow key={item._id} className="hover:bg-secondary/5 border-b border-secondary/5 transition-colors">
                    <TableCell>
                      <div className="font-medium text-foreground">{item.name}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{item.phoneNumber}</span>
                        <TooltipProvider>
                          <ShadcnTooltip>
                            <TooltipTrigger asChild>
                              <a 
                                href={`tel:${item.phoneNumber}`}
                                className="text-primary hover:text-primary/80 transition-colors"
                                data-testid={`link-call-${item._id}`}
                              >
                                <Phone className="h-4 w-4" />
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Call Customer</p>
                            </TooltipContent>
                          </ShadcnTooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{getOrdinal(visitNumber)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span className="font-bold text-primary">
                          {avgRating}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px]">
                      <span className="truncate block text-sm text-muted-foreground">
                        {latestVisit?.note || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground w-[92px]">
                      {latestVisit?.createdAt ? (
                        <div>
                          <span className="whitespace-nowrap block">{format(new Date(latestVisit.createdAt), 'MMM d,')}</span>
                          <span className="whitespace-nowrap block">{format(new Date(latestVisit.createdAt), 'h:mm a')}</span>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {isContacted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          CONTACTED
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          PENDING
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!isContacted && (
                          <Button
                            size="sm"
                            className="rounded-lg h-7 px-2 py-0.5 text-xs bg-secondary text-white hover:bg-secondary/90 gap-1"
                            onClick={() => handleMarkContacted(item._id)}
                            disabled={markContacted.isPending}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="hidden lg:inline">Mark Contacted</span>
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-lg h-7 px-2 py-0.5 text-xs border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000]/5 gap-1"
                              data-testid={`button-view-details-${item._id}`}
                            >
                              <Eye className="h-3 w-3" />
                              <span className="hidden lg:inline">View History</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-display text-secondary">Customer History: {item.name}</DialogTitle>
                              <DialogDescription className="flex flex-col gap-1">
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" /> {item.phoneNumber}
                                </span>
                                <span>Viewing all {visits.length} feedback submissions</span>
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 pt-4">
                              {visits.length === 0 && (
                                <p className="text-center text-muted-foreground py-6">No feedback provided by customer</p>
                              )}
                              {visits.slice().reverse().map((visit: any, idx: number) => (
                                <div key={idx} className="p-4 rounded-2xl border border-secondary/10 bg-secondary/5 space-y-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-sm font-semibold text-secondary">{format(new Date(visit.createdAt), 'MMMM d, yyyy h:mm a')}</p>
                                      <p className="text-xs text-muted-foreground">{visit.location} • {visit.dineType === 'dine_in' ? 'Dine In' : 'Take Out'}</p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm">
                                      <Star className="h-3 w-3 fill-primary text-primary" />
                                      <span className="font-bold text-primary">
                                        {((Object.values(visit.ratings) as number[]).reduce((a: number, b: number) => a + b, 0) / 6).toFixed(1)}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {Object.entries(visit.ratings).map(([cat, val]) => (
                                      <div key={cat} className="text-xs p-2 bg-white rounded-lg">
                                        <span className="text-muted-foreground block capitalize">{cat.replace(/([A-Z])/g, ' $1')}</span>
                                        <span className="font-bold text-secondary">{val as number}/5</span>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="text-sm italic text-muted-foreground bg-white/50 p-2 rounded-lg">
                                    {visit.note && visit.note !== '-'
                                      ? `"${visit.note}"`
                                      : 'No comment provided by customer'}
                                  </div>

                                  <div className="bg-white p-3 rounded-xl shadow-sm text-sm border border-secondary/5">
                                    <div className="flex flex-col gap-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-secondary">Staff Name:</span>
                                        <span className="text-muted-foreground">{visit.staffName}</span>
                                      </div>
                                      {visit.staffComment && (
                                        <div className="flex flex-col gap-1">
                                          <span className="font-semibold text-secondary">Staff Comment:</span>
                                          <p className="text-muted-foreground italic">"{visit.staffComment}"</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="pt-4 border-t border-secondary/10 flex justify-end">
                              {isContacted ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                  <CheckCircle2 className="h-4 w-4 mr-1.5" /> CONTACTED
                                </span>
                              ) : (
                                <Button
                                  className="bg-secondary text-white hover:bg-secondary/90"
                                  onClick={() => handleMarkContacted(item._id)}
                                  disabled={markContacted.isPending}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  {markContacted.isPending ? "Updating..." : "Mark as Contacted"}
                                </Button>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        
        {/* Pagination controls */}
        {data && data.pagination.pages > 1 && (
          <div className="p-4 border-t border-secondary/10 flex justify-between items-center">
             <Button 
               variant="outline" 
               size="sm" 
               onClick={() => setPage(p => Math.max(1, p - 1))}
               disabled={page === 1}
               className="rounded-lg"
             >
               Previous
             </Button>
             <span className="text-sm text-muted-foreground">
               Page {page} of {data.pagination.pages}
             </span>
             <Button 
               variant="outline" 
               size="sm" 
               onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
               disabled={page === data.pagination.pages}
               className="rounded-lg"
             >
               Next
             </Button>
          </div>
        )}
      </div>
    </div>
  );
}
