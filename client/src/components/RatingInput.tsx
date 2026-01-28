import { Star, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  icon?: LucideIcon;
}

export function RatingInput({ value, onChange, label, icon: Icon }: RatingInputProps) {
  return (
    <div className="flex items-start gap-3 py-3">
      {Icon && (
        <div className="flex-shrink-0 mt-1">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      )}
      <div className="flex-1">
        <label className="text-sm font-medium text-secondary block mb-2">{label}</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                className={cn(
                  "w-8 h-8 transition-all duration-200",
                  star <= value
                    ? "fill-primary text-primary drop-shadow-md"
                    : "fill-transparent text-muted-foreground/30 hover:text-primary/50"
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
