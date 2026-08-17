import { forwardRef } from 'react';

const VARIANTS = {
  primary:
    'bg-primary text-white shadow-xs hover:bg-primary-strong disabled:bg-border disabled:text-ink-faint disabled:shadow-none',
  secondary:
    'border border-border bg-surface text-ink hover:border-border-strong hover:bg-surface-hover disabled:opacity-50',
  ghost: 'text-ink-soft hover:bg-surface-hover hover:text-ink disabled:opacity-40',
  danger: 'border border-danger/25 bg-danger-soft text-danger hover:border-danger/40 disabled:opacity-40',
  dangerSolid: 'bg-danger text-white hover:opacity-90 disabled:opacity-40',
};

const SIZES = {
  sm: 'h-8 px-3.5 text-[13px] gap-1.5',
  md: 'h-10 px-5 text-sm gap-2',
  lg: 'h-11 px-6 text-[15px] gap-2',
};

/**
 * Base action control for the whole app — fully rounded (pill-shaped),
 * clear focus ring, disabled state built in. Every button in the redesign
 * routes through this instead of one-off Tailwind strings.
 */
const Button = forwardRef(function Button(
  { as: Comp = 'button', variant = 'secondary', size = 'md', className = '', children, ...props },
  ref,
) {
  return (
    <Comp
      ref={ref}
      className={`inline-flex select-none items-center justify-center rounded-full font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
});

export default Button;
