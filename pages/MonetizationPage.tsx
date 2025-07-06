import type React from 'react';
import { useState, useEffect, memo, lazy, Suspense } from 'react';

import { BanknotesIcon, ArrowTrendingUpIcon, CurrencyDollarIcon, ChartBarIcon, GiftIcon } from '@heroicons/react/24/outline';
// Register Chart.js components when needed
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Lazy load Chart.js components for better performance
const LazyLineChart = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Line })));
const LazyDoughnutChart = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Doughnut })));

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);


interface RevenueData {
  date: string;
  adRevenue: number;
  membershipRevenue: number;
  superChatRevenue: number;
  merchandiseRevenue: number;
  sponsorshipRevenue: number;
}

interface MonetizationMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  rpm: number; // Revenue per mille (thousand views)
  cpm: number; // Cost per mille
  adImpressions: number;
  clickThroughRate: number;
  memberCount: number;
  superChatCount: number;
  merchandiseSales: number;
  membershipRevenue: number;
  superChatRevenue: number;
}

const MonetizationPage: React.FC = () => {
  const [metrics, setMetrics] = useState<MonetizationMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'rpm' | 'cpm'>('revenue');

  useEffect(() => {
    const generateMockData = () => {
      setLoading(true);

      // Generate mock revenue data
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const mockRevenueData: RevenueData[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        mockRevenueData.push({
          date: date.toISOString().split('T')[0] || date.toDateString(),
          adRevenue: Math.random() * 100 + 50,
          membershipRevenue: Math.random() * 30 + 10,
          superChatRevenue: Math.random() * 20 + 5,
          merchandiseRevenue: Math.random() * 15 + 2,
          sponsorshipRevenue: Math.random() * 200 + 100,
        });
      }

      setRevenueData(mockRevenueData);

      // Generate mock metrics
      const totalRevenue = mockRevenueData.reduce((sum, day) =>
        sum + day.adRevenue + day.membershipRevenue + day.superChatRevenue + day.merchandiseRevenue + day.sponsorshipRevenue, 0,
      );

      const membershipRevenue = mockRevenueData.reduce((sum, day) => sum + day.membershipRevenue, 0);
      const superChatRevenue = mockRevenueData.reduce((sum, day) => sum + day.superChatRevenue, 0);

      setMetrics({
        totalRevenue,
        monthlyRevenue: totalRevenue * (30 / days),
        revenueGrowth: Math.random() * 20 + 5,
        rpm: Math.random() * 5 + 2,
        cpm: Math.random() * 3 + 1,
        adImpressions: Math.floor(Math.random() * 100000 + 50000),
        clickThroughRate: Math.random() * 3 + 1,
        memberCount: Math.floor(Math.random() * 1000 + 500),
        superChatCount: Math.floor(Math.random() * 200 + 50),
        merchandiseSales: Math.floor(Math.random() * 50 + 10),
        membershipRevenue,
        superChatRevenue,
      });

      setLoading(false);
    };

    generateMockData();
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getRevenueChartData = () => {
    const labels = revenueData.map(data => {
      const date = new Date(data.date);
      return timeRange === '7d' || timeRange === '30d'
        ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Ad Revenue',
          data: revenueData.map(d => d.adRevenue),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Membership Revenue',
          data: revenueData.map(d => d.membershipRevenue),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Super Chat',
          data: revenueData.map(d => d.superChatRevenue),
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Sponsorships',
          data: revenueData.map(d => d.sponsorshipRevenue),
          borderColor: 'rgb(139, 92, 246)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  const getRevenueSourcesData = () => {
    if (!revenueData.length) {
return { labels: [], datasets: [] };
}

    const totals = revenueData.reduce((acc, day) => ({
      adRevenue: acc.adRevenue + day.adRevenue,
      membershipRevenue: acc.membershipRevenue + day.membershipRevenue,
      superChatRevenue: acc.superChatRevenue + day.superChatRevenue,
      merchandiseRevenue: acc.merchandiseRevenue + day.merchandiseRevenue,
      sponsorshipRevenue: acc.sponsorshipRevenue + day.sponsorshipRevenue,
    }), { adRevenue: 0, membershipRevenue: 0, superChatRevenue: 0, merchandiseRevenue: 0, sponsorshipRevenue: 0 });

    return {
      labels: ['Ad Revenue', 'Memberships', 'Super Chat', 'Merchandise', 'Sponsorships'],
      datasets: [
        {
          data: [
            totals.adRevenue,
            totals.membershipRevenue,
            totals.superChatRevenue,
            totals.merchandiseRevenue,
            totals.sponsorshipRevenue,
          ],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)',
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(139, 92, 246)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => formatCurrency(value),
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
          },
        },
      },
    },
  };

  if (loading || !metrics) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
            <div className="h-96 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-4 sm:mb-0">
          Monetization Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Revenue</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {formatCurrency(metrics.totalRevenue)}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                +{metrics.revenueGrowth.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BanknotesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">RPM (Revenue per 1K views)</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {formatCurrency(metrics.rpm)}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {formatNumber(metrics.adImpressions)} impressions
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Channel Members</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {formatNumber(metrics.memberCount)}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {formatCurrency(metrics.membershipRevenue)} this period
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <GiftIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Super Chats</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {formatNumber(metrics.superChatCount)}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {formatCurrency(metrics.superChatRevenue)} earned
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Revenue Over Time
            </h2>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-3 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            >
              <option value="revenue">Revenue</option>
              <option value="rpm">RPM</option>
              <option value="cpm">CPM</option>
            </select>
          </div>
          <div className="h-80">
            <Suspense fallback={<div className="flex items-center justify-center h-full">Loading chart...</div>}>
              <LazyLineChart data={getRevenueChartData()} options={chartOptions} />
            </Suspense>
          </div>
        </div>

        {/* Revenue Sources */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-6">
            Revenue Sources
          </h2>
          <div className="h-80">
            <Suspense fallback={<div className="flex items-center justify-center h-full">Loading chart...</div>}>
              <LazyDoughnutChart data={getRevenueSourcesData()} options={doughnutOptions} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-6">
          Detailed Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-neutral-700 dark:text-neutral-300">Ad Performance</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">CPM</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                  {formatCurrency(metrics.cpm)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Click-through Rate</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                  {metrics.clickThroughRate.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Ad Impressions</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                  {formatNumber(metrics.adImpressions)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-neutral-700 dark:text-neutral-300">Membership</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Members</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                  {formatNumber(metrics.memberCount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Avg. Revenue per Member</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                  {formatCurrency(metrics.membershipRevenue / metrics.memberCount)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-neutral-700 dark:text-neutral-300">Merchandise</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Units Sold</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                  {formatNumber(metrics.merchandiseSales)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Avg. Order Value</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                  {formatCurrency(revenueData.reduce((sum, day) => sum + day.merchandiseRevenue, 0) / metrics.merchandiseSales)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payout Information */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
          Payout Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Current Balance</h3>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(metrics.totalRevenue * 0.8)}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Available for payout
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">Next Payout</h3>
            <p className="text-lg font-semibold text-green-900 dark:text-green-100">
              {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Estimated date
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Payment Method</h3>
            <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">
              Bank Transfer
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
              ****1234
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(MonetizationPage);