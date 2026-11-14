import { LucideIcon, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = Activity,
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 px-4', className)}>
      {/* Icon container with radar halo */}
      <div className="relative mb-5 flex items-center justify-center animate-scale-in">
        <div className="absolute w-20 h-20 rounded-full bg-accent/10 dark:bg-accent/15 blur-sm" />
        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-hover)] shadow-md flex items-center justify-center text-accent relative z-10">
          <Icon className="w-6 h-6" strokeWidth={1.75} />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1.5 animate-fade-in tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-[var(--text-secondary)] text-center max-w-md mb-6 animate-fade-in leading-relaxed" style={{ animationDelay: '100ms' }}>
        {description}
      </p>

      {children && (
        <div className="mb-8 w-full max-w-2xl animate-fade-in" style={{ animationDelay: '150ms' }}>
          {children}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
        {action && (
          <button onClick={action.onClick} className="btn-gradient px-5 py-2.5 text-sm">
            {action.label}
          </button>
        )}
        {secondaryAction && (
          <button onClick={secondaryAction.onClick} className="btn-glass px-5 py-2.5 text-sm">
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}
