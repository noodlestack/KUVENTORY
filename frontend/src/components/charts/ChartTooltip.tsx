import React, { memo } from "react";
import { useTheme } from "next-themes";
import { TooltipProps } from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

export const ChartTooltip = memo(({ active, payload, label, formatter }: TooltipProps<ValueType, NameType>) => {
  const { resolvedTheme } = useTheme();
  
  if (active && payload && payload.length) {
    const isDark = resolvedTheme === "dark";
    
    return (
      <div 
        className="rounded-md p-3 shadow-md max-w-[200px] sm:max-w-xs transition-colors duration-200"
        style={{
          backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
          borderColor: isDark ? '#3A3A3A' : '#DDDDDD',
          borderWidth: 1,
          borderStyle: 'solid',
          color: isDark ? '#FFFFFF' : '#111111',
        }}
      >
        {label ? (
          <p 
            className="font-semibold mb-2 text-sm truncate"
            style={{ color: isDark ? '#FFFFFF' : '#111111' }}
          >
            {label}
          </p>
        ) : null}
        <div className="space-y-1">
          {payload.map((entry, index) => {
             const value = entry.value;
             let displayValue: React.ReactNode = value as React.ReactNode;
             let displayName: React.ReactNode = entry.name;
             
             if (formatter && value != null) {
                const formatted = formatter(value, entry.name || '', entry, index, payload);
                if (Array.isArray(formatted)) {
                   displayValue = formatted[0];
                   displayName = formatted[1] || displayName;
                } else {
                   displayValue = formatted;
                }
             }

             return (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 truncate">
                  <div 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: entry.color || entry.payload?.fill || '#8884d8' }} 
                  />
                  <span 
                    className="truncate"
                    style={{ color: isDark ? '#E5E5E5' : '#4B5563' }}
                  >
                    {displayName}:
                  </span>
                </div>
                <span 
                  className="font-medium shrink-0"
                  style={{ color: isDark ? '#FFD54F' : '#111111' }}
                >
                  {displayValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
});

ChartTooltip.displayName = 'ChartTooltip';
