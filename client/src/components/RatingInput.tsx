import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

export function RatingInput({ value, onChange, label }: RatingInputProps) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-secondary">{label}</label>
      <div className="flex items-center gap-2">
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
        <span className="ml-2 text-sm font-semibold text-primary min-w-[3ch]">
          {value > 0 ? value.toFixed(1) : ""}
        </span>
      </div>
    </div>
  );
}
