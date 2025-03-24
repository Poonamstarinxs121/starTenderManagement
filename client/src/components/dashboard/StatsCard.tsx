import { ReactNode } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  changeText?: string;
  changeDirection?: 'up' | 'down' | 'neutral';
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
}

export function StatsCard({
  title,
  value,
  changeText,
  changeDirection = 'neutral',
  icon,
  iconBgColor,
  iconColor
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-2xl font-semibold text-gray-800">{value}</p>
          </div>
          <div className={`w-12 h-12 ${iconBgColor} rounded-full flex items-center justify-center`}>
            <div className={iconColor}>
              {icon}
            </div>
          </div>
        </div>
        
        {changeText && (
          <div className={`mt-2 flex items-center text-xs ${
            changeDirection === 'up' 
              ? 'text-green-600' 
              : changeDirection === 'down' 
                ? 'text-red-600' 
                : 'text-gray-600'
          }`}>
            {changeDirection === 'up' && <ArrowUp className="h-3 w-3 mr-1" />}
            {changeDirection === 'down' && <ArrowDown className="h-3 w-3 mr-1" />}
            {changeDirection === 'neutral' && <Minus className="h-3 w-3 mr-1" />}
            <span>{changeText}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StatsCard;
