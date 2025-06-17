'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DailyStats {
  date: string;
  views: number;
  orders: number;
  revenue: number;
}

interface AnalyticsChartProps {
  dailyStats: DailyStats[];
  title: string;
  metric: 'views' | 'orders' | 'revenue';
}

export default function AnalyticsChart({ dailyStats, title, metric }: AnalyticsChartProps) {
  const chartData = useMemo(() => {
    if (!dailyStats || dailyStats.length === 0) return { data: [], trend: 0, change: 0 };

    // Get data for the chart
    const data = dailyStats.map(stat => ({
      date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: metric === 'revenue' ? stat.revenue / 100 : stat[metric], // Convert revenue from cents
    }));

    // Calculate trend (last 7 days vs previous 7 days)
    const recentData = data.slice(-7);
    const previousData = data.slice(-14, -7);
    
    const recentSum = recentData.reduce((sum, item) => sum + item.value, 0);
    const previousSum = previousData.reduce((sum, item) => sum + item.value, 0);
    
    const change = previousSum === 0 ? 0 : ((recentSum - previousSum) / previousSum) * 100;
    const trend = change > 0 ? 1 : change < 0 ? -1 : 0;

    return { data, trend, change };
  }, [dailyStats, metric]);

  const maxValue = Math.max(...chartData.data.map(d => d.value), 1);

  const formatValue = (value: number) => {
    if (metric === 'revenue') return `$${value.toFixed(2)}`;
    return value.toString();
  };

  const getTrendIcon = () => {
    if (chartData.trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (chartData.trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (chartData.trend > 0) return 'text-green-600';
    if (chartData.trend < 0) return 'text-red-600';
    return 'text-gray-400';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {chartData.change !== 0 ? `${chartData.change > 0 ? '+' : ''}${chartData.change.toFixed(1)}%` : '0%'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Mini chart */}
          <div className="h-20 flex items-end justify-between space-x-1">
            {chartData.data.slice(-14).map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className={`w-full rounded-t transition-all duration-300 ${
                    index >= chartData.data.length - 7 
                      ? 'bg-singleshop-blue' 
                      : 'bg-gray-200'
                  }`}
                  style={{ 
                    height: `${Math.max((item.value / maxValue) * 100, 2)}%`,
                    minHeight: '2px'
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* Recent values */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{chartData.data[0]?.date || 'No data'}</span>
            <span>{chartData.data[chartData.data.length - 1]?.date || 'No data'}</span>
          </div>

          {/* Current total */}
          <div className="pt-2 border-t">
            <div className="text-2xl font-bold">
              {formatValue(chartData.data.reduce((sum, item) => sum + item.value, 0))}
            </div>
            <div className="text-sm text-muted-foreground">
              Last {chartData.data.length} days
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}