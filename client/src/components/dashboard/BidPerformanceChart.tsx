import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

type TimeRange = 'monthly' | 'quarterly' | 'yearly';

interface BidPerformanceChartProps {
  data?: {
    name: string;
    won: number;
    lost: number;
  }[];
  isLoading?: boolean;
}

// Sample data
const monthlyData = [
  { name: 'Jan', won: 4, lost: 2 },
  { name: 'Feb', won: 2, lost: 3 },
  { name: 'Mar', won: 3, lost: 1 },
  { name: 'Apr', won: 5, lost: 2 },
  { name: 'May', won: 1, lost: 2 },
  { name: 'Jun', won: 3, lost: 3 },
];

const quarterlyData = [
  { name: 'Q1', won: 8, lost: 6 },
  { name: 'Q2', won: 12, lost: 7 },
  { name: 'Q3', won: 7, lost: 5 },
  { name: 'Q4', won: 10, lost: 8 },
];

const yearlyData = [
  { name: '2020', won: 30, lost: 22 },
  { name: '2021', won: 42, lost: 28 },
  { name: '2022', won: 37, lost: 25 },
  { name: '2023', won: 45, lost: 30 },
];

export function BidPerformanceChart({ data, isLoading = false }: BidPerformanceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  
  const getChartData = () => {
    if (data) return data;
    
    switch (timeRange) {
      case 'quarterly':
        return quarterlyData;
      case 'yearly':
        return yearlyData;
      default:
        return monthlyData;
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Bid Performance</h2>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant={timeRange === 'monthly' ? "default" : "outline"}
              onClick={() => setTimeRange('monthly')}
            >
              Monthly
            </Button>
            <Button 
              size="sm" 
              variant={timeRange === 'quarterly' ? "default" : "outline"}
              onClick={() => setTimeRange('quarterly')}
            >
              Quarterly
            </Button>
            <Button 
              size="sm" 
              variant={timeRange === 'yearly' ? "default" : "outline"}
              onClick={() => setTimeRange('yearly')}
            >
              Yearly
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="h-64 w-full flex items-center justify-center">
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={300}
                data={getChartData()}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="won" name="Won" fill="hsl(var(--primary))" />
                <Bar dataKey="lost" name="Lost" fill="hsl(var(--muted))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BidPerformanceChart;
