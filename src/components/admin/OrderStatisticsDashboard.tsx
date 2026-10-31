import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Calendar,
  Flame,
  Award,
  CreditCard,
  PieChart as PieIcon,
  BarChart3,
  RefreshCw,
  Zap,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { AdminStatistics } from '../../types';
import { ThreeKitchenRadar } from './ThreeKitchenRadar';

interface OrderStatisticsDashboardProps {
  stats: AdminStatistics | null;
  loading: boolean;
  onRefresh: () => void;
}

export const OrderStatisticsDashboard: React.FC<OrderStatisticsDashboardProps> = ({
  stats,
  loading,
  onRefresh,
}) => {
  const [salesMetricView, setSalesMetricView] = useState<'both' | 'sales' | 'orders'>('both');
  const [hourlyMetricView, setHourlyMetricView] = useState<'orders' | 'sales'>('orders');

  if (loading && !stats) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-orange-400 animate-spin mx-auto" />
        <h3 className="text-base font-bold text-white">Aggregating 7-Day Kitchen & Order Statistics...</h3>
        <p className="text-xs text-slate-400">Loading daily sales trends, peak rush hours, and category metrics.</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center">
        <p className="text-xs text-slate-400">No order statistics available yet.</p>
      </div>
    );
  }

  const { salesTrends, hourlyTrends, categoryBreakdown, paymentDistribution, summary } = stats;

  // Custom Glassmorphism Tooltip for Sales Trends
  const CustomSalesTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-panel p-3.5 rounded-2xl border border-orange-500/40 shadow-2xl backdrop-blur-xl bg-[#070a11]/95 text-xs space-y-1.5 min-w-[190px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-bold text-white font-display">{data.dayName}, {data.displayDate}</span>
            <span className="text-[10px] text-slate-400 font-mono">{data.date}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              Total Sales:
            </span>
            <span className="font-mono font-bold text-white">Rs. {data.sales.toLocaleString('en-PK')}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Orders Placed:
            </span>
            <span className="font-mono font-bold text-sky-400">{data.orders} orders</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-white/10">
            <span>Avg Order Value:</span>
            <span className="font-mono font-semibold text-amber-300">Rs. {data.avgOrderValue}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Peak Hours
  const CustomHourlyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const nextHour = (data.hour + 1) % 12 === 0 ? 12 : (data.hour + 1) % 12;
      const nextPeriod = data.hour + 1 >= 12 && data.hour + 1 < 24 ? 'PM' : 'AM';
      const timeWindow = `${data.label} – ${nextHour} ${nextPeriod}`;

      return (
        <div className="glass-panel p-3.5 rounded-2xl border border-amber-500/40 shadow-2xl backdrop-blur-xl bg-[#070a11]/95 text-xs space-y-1.5 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-bold text-white font-display flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {timeWindow}
            </span>
            {data.peakType && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                data.peakType === 'dinner' ? 'bg-orange-500/30 text-orange-400 border border-orange-500/40' : 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
              }`}>
                {data.peakType === 'dinner' ? 'Dinner Rush' : 'Lunch Peak'}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Orders Volume:
            </span>
            <span className="font-mono font-bold text-white">{data.orders} orders</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              Hourly Sales:
            </span>
            <span className="font-mono font-bold text-orange-400">Rs. {data.sales.toLocaleString('en-PK')}</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10">
            {data.isPeak ? '🔥 High volume rush hour in Lahore' : 'Regular operational period'}
          </div>
        </div>
      );
    }
    return null;
  };

  const CATEGORY_COLORS = ['#f97316', '#f59e0b', '#38bdf8', '#10b981', '#ec4899', '#a855f7', '#64748b'];
  const PAYMENT_COLORS = ['#f59e0b', '#10b981', '#38bdf8'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-orange-400 font-mono">
              Live Recharts Analytics Engine · Lahore, PK
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Order Statistics & Peak Hour Trends
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Multi-dimensional visual telemetry for the past 7 days across Lahore delivery zones. Monitor revenue velocity, meal peak rushes, and culinary demand.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-4 py-2.5 glass-btn-secondary text-xs font-bold rounded-2xl flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Statistics</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Card 1: 7-Day Revenue */}
        <div className="glass-panel p-5 rounded-3xl border border-orange-500/20 shadow-xl relative overflow-hidden group hover:border-orange-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">7-Day Sales</span>
            <TrendingUp className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
            Rs. {summary.totalSales7d.toLocaleString('en-PK')}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              +{summary.growthVsLastWeek}%
            </span>
            <span className="text-[10px] text-slate-400">vs prior week</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 2: 7-Day Orders */}
        <div className="glass-panel p-5 rounded-3xl border border-sky-500/20 shadow-xl relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
            {summary.totalOrders7d}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-medium">
            ~{Math.round(summary.totalOrders7d / 7)} orders / day
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-sky-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 3: Peak Rush Hour */}
        <div className="glass-panel p-5 rounded-3xl border border-amber-500/20 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Peak Rush Window</span>
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div className="text-sm sm:text-base font-extrabold text-amber-300 font-display truncate">
            {summary.peakHour}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-medium">
            {summary.peakHourOrders} orders volume peak
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 4: Average Order Value */}
        <div className="glass-panel p-5 rounded-3xl border border-emerald-500/20 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Order Value</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
            Rs. {summary.avgOrderValue}
          </div>
          <div className="text-[11px] text-emerald-400/90 mt-2 font-medium">
            High basket size
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 5: Best Sales Day */}
        <div className="glass-panel p-5 rounded-3xl border border-purple-500/20 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Busiest Day</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm sm:text-base font-extrabold text-white font-display truncate">
            {summary.bestDay}
          </div>
          <div className="text-[11px] text-purple-300 mt-2 font-mono">
            Rs. {summary.bestDaySales.toLocaleString('en-PK')}
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* 3. Primary Chart 1: Total Sales Trends for Past 7 Days */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                Total Sales Trends (Past 7 Days)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Daily revenue in Pakistani Rupees (Rs.) paired with order counts from Oct 25 to Oct 31, 2026.
            </p>
          </div>

          {/* Metric Selector Pills */}
          <div className="flex items-center gap-1.5 p-1 glass-card rounded-2xl border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setSalesMetricView('both')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                salesMetricView === 'both' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Both Metrics
            </button>
            <button
              onClick={() => setSalesMetricView('sales')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                salesMetricView === 'sales' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sales (Rs.)
            </button>
            <button
              onClick={() => setSalesMetricView('orders')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                salesMetricView === 'orders' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Orders Count
            </button>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="w-full h-[320px] sm:h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesTrends} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.65} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.07} vertical={false} />
              
              <XAxis
                dataKey="displayDate"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#ffffff', opacity: 0.15 }}
                tickFormatter={(val, idx) => `${salesTrends[idx]?.dayName} ${val}`}
              />

              <YAxis
                yAxisId="salesAxis"
                orientation="left"
                stroke="#f97316"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `Rs.${(val / 1000).toFixed(0)}k`}
                hide={salesMetricView === 'orders'}
              />

              <YAxis
                yAxisId="ordersAxis"
                orientation="right"
                stroke="#38bdf8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val} ord`}
                hide={salesMetricView === 'sales'}
              />

              <Tooltip content={<CustomSalesTooltip />} />

              <Legend
                verticalAlign="top"
                align="right"
                height={36}
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
                iconType="circle"
              />

              {(salesMetricView === 'both' || salesMetricView === 'sales') && (
                <Area
                  yAxisId="salesAxis"
                  type="monotone"
                  dataKey="sales"
                  name="Sales Revenue (Rs.)"
                  stroke="#f97316"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                  activeDot={{ r: 6, fill: '#ea580c', stroke: '#fff', strokeWidth: 2 }}
                />
              )}

              {(salesMetricView === 'both' || salesMetricView === 'orders') && (
                <Area
                  yAxisId="ordersAxis"
                  type="monotone"
                  dataKey="orders"
                  name="Orders Count"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#ordersGrad)"
                  activeDot={{ r: 5, fill: '#0284c7', stroke: '#fff', strokeWidth: 2 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Breakdown Chips Footer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-4 border-t border-white/10">
          {salesTrends.map((d) => (
            <div key={d.date} className="p-3 rounded-2xl glass-card border border-white/5 text-center">
              <span className="text-[10px] font-bold text-slate-400 block">{d.dayName}</span>
              <span className="text-xs font-semibold text-slate-200 block">{d.displayDate}</span>
              <div className="font-mono font-bold text-orange-400 text-xs mt-1">
                Rs. {d.sales.toLocaleString('en-PK')}
              </div>
              <span className="text-[10px] text-sky-400 font-mono block mt-0.5">{d.orders} orders</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Primary Chart 2: Peak Order Hours (24-Hour Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                  Peak Order Hours (24-Hour Activity)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Aggregated hourly order volume across the past 7 days. Highlights Lunch Rush (12–3 PM) & Dinner Surge (7–11 PM).
              </p>
            </div>

            {/* Toggle Orders vs Sales */}
            <div className="flex items-center gap-1.5 p-1 glass-card rounded-2xl border border-white/10 self-start sm:self-auto">
              <button
                onClick={() => setHourlyMetricView('orders')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  hourlyMetricView === 'orders' ? 'bg-amber-500 text-stone-950 font-extrabold shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Orders Count
              </button>
              <button
                onClick={() => setHourlyMetricView('sales')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  hourlyMetricView === 'sales' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sales (Rs.)
              </button>
            </div>
          </div>

          {/* Recharts Bar Chart for 24 Hours */}
          <div className="w-full h-[300px] sm:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyTrends} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.07} vertical={false} />
                
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  interval={1}
                  axisLine={{ stroke: '#ffffff', opacity: 0.15 }}
                />

                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => hourlyMetricView === 'sales' ? `Rs.${(val / 1000).toFixed(0)}k` : `${val}`}
                />

                <Tooltip content={<CustomHourlyTooltip />} />

                <Bar
                  dataKey={hourlyMetricView === 'orders' ? 'orders' : 'sales'}
                  radius={[6, 6, 0, 0]}
                >
                  {hourlyTrends.map((entry, index) => {
                    let fill = '#334155'; // default off-peak
                    if (entry.peakType === 'dinner') fill = '#f97316'; // dinner peak in orange
                    else if (entry.peakType === 'lunch') fill = '#fbbf24'; // lunch peak in amber
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Peak Hour Legend & Insights */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#fbbf24]" />
                <span className="text-slate-300 font-medium">Lunch Peak (12 PM – 3 PM)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#f97316]" />
                <span className="text-slate-300 font-medium">Dinner Rush (7 PM – 11 PM)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#334155]" />
                <span className="text-slate-400">Regular Hours</span>
              </div>
            </div>

            <div className="text-[11px] font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-xl border border-orange-500/20">
              🔥 Lahore Dinner Peak brings 64% of daily volume
            </div>
          </div>
        </div>

        {/* 3D Kitchen Radar Card (Three.js PBR Scene) */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between">
          <div className="space-y-1 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 font-mono">
                Three.js WebGL Scene
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PBR ToneMapped
              </span>
            </div>
            <h3 className="text-base font-bold text-white font-display">
              Royal Handi & Dispatch Hub
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive 3D procedural simulation of Lahore's active handi tandoors and live order dispatch nodes.
            </p>
          </div>

          {/* Three.js 3D Canvas Mount */}
          <div className="flex-1 w-full min-h-[260px] my-2">
            <ThreeKitchenRadar />
          </div>

          <div className="pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Dispatched via DHA & Gulberg</span>
            <span className="font-mono text-emerald-400 font-bold">100% On-Time</span>
          </div>
        </div>
      </div>

      {/* 5. Secondary Analytics: Category Distribution & Payment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Category Revenue Breakdown */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-orange-400" />
              <h3 className="text-base font-bold font-display text-white">
                Revenue by Food Category (7 Days)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 font-mono">
              Top Desi Favorites
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="sales"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cat-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`Rs. ${Number(value).toLocaleString('en-PK')}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#070a11', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {categoryBreakdown.slice(0, 5).map((cat, idx) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    />
                    <span className="text-slate-300 font-medium truncate max-w-[120px]">{cat.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-white font-bold">Rs. {cat.sales.toLocaleString('en-PK')}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">({cat.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold font-display text-white">
                Payment Channel Split (7 Days)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 font-mono">
              Pakistan Sandboxes & COD
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {paymentDistribution.map((pay, idx) => {
              const totalAll = paymentDistribution.reduce((a, b) => a + b.total, 0) || 1;
              const percent = Math.round((pay.total / totalAll) * 100);

              return (
                <div key={pay.method} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{pay.method}</span>
                    <div className="font-mono">
                      <span className="font-bold text-white">Rs. {pay.total.toLocaleString('en-PK')}</span>
                      <span className="text-slate-400 ml-2 text-[11px]">({pay.count} orders · {percent}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: PAYMENT_COLORS[idx % PAYMENT_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Instant sandbox settlement enabled</span>
            <span className="text-emerald-400 font-semibold font-mono">Zero Payment Dropoff</span>
          </div>
        </div>
      </div>
    </div>
  );
};
