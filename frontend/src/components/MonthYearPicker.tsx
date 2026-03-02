import React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface MonthYearPickerProps {
    value: Date;
    onChange: (date: Date) => void;
    disabled?: boolean;
}

const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function MonthYearPicker({ value, onChange, disabled }: MonthYearPickerProps) {
    const [open, setOpen] = React.useState(false);
    const [viewYear, setViewYear] = React.useState(value.getFullYear());

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Allow 3 years back and 1 year forward
    const minYear = currentYear - 3;
    const maxYear = currentYear + 1;

    const handleMonthSelect = (monthIndex: number) => {
        const newDate = new Date(viewYear, monthIndex, 1);
        onChange(newDate);
        setOpen(false);
    };

    const isSelected = (monthIndex: number) =>
        value.getFullYear() === viewYear && value.getMonth() === monthIndex;

    const isFuture = (monthIndex: number) =>
        viewYear > currentYear || (viewYear === currentYear && monthIndex > currentMonth);

    const displayLabel = `${MONTH_NAMES[value.getMonth()]} ${value.getFullYear()}`;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    disabled={disabled}
                    className="gap-2 min-w-[140px] justify-start font-medium"
                >
                    <CalendarDays size={15} className="text-muted-foreground" />
                    {displayLabel}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
                {/* Year navigation */}
                <div className="flex items-center justify-between mb-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setViewYear((y) => Math.max(minYear, y - 1))}
                        disabled={viewYear <= minYear}
                    >
                        <ChevronLeft size={14} />
                    </Button>
                    <span className="text-sm font-semibold text-foreground">{viewYear}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setViewYear((y) => Math.min(maxYear, y + 1))}
                        disabled={viewYear >= maxYear}
                    >
                        <ChevronRight size={14} />
                    </Button>
                </div>

                {/* Month grid */}
                <div className="grid grid-cols-3 gap-1.5">
                    {MONTH_NAMES.map((month, idx) => (
                        <button
                            key={month}
                            onClick={() => !isFuture(idx) && handleMonthSelect(idx)}
                            disabled={isFuture(idx)}
                            className={`
                                px-2 py-1.5 rounded-md text-sm font-medium transition-colors
                                ${isSelected(idx)
                                    ? 'bg-primary text-primary-foreground'
                                    : isFuture(idx)
                                        ? 'text-muted-foreground/40 cursor-not-allowed'
                                        : 'text-foreground hover:bg-muted cursor-pointer'
                                }
                            `}
                        >
                            {month}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
