import { ReactNode, useId } from "react";

interface Option {
  value: string | number;
  label: string;
}

interface BaseFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

interface InputProps
  extends BaseFieldProps,
    React.InputHTMLAttributes<HTMLInputElement> {
  as?: "input";
}

interface TextareaProps
  extends BaseFieldProps,
    React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: "textarea";
}

interface SelectProps
  extends BaseFieldProps,
    React.SelectHTMLAttributes<HTMLSelectElement> {
  as: "select";
  options?: Option[];
  placeholder?: string;
  children?: ReactNode;
}

export type FieldProps = InputProps | TextareaProps | SelectProps;

export function Field(props: FieldProps) {
  const generatedId = useId();

  const {
    as = "input",
    label,
    error,
    helperText,
    className = "",
    id = generatedId,
    disabled,
    ...restProps
  } = props;

  // Estilos de bordes y focos
  const baseControlStyles =
    "w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink/40 disabled:cursor-not-allowed disabled:opacity-50 focus:border-brand focus:ring-4 focus:ring-brand/20";

  const errorControlStyles = error
    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
    : "";

  const controlClasses = `${baseControlStyles} ${errorControlStyles} ${className}`;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold uppercase tracking-wider text-ink/70"
        >
          {label}
        </label>
      )}

      {as === "input" && (
        <input
          id={id}
          disabled={disabled}
          className={controlClasses}
          {...(restProps as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {as === "textarea" && (
        <textarea
          id={id}
          disabled={disabled}
          className={`${controlClasses} min-h-25 resize-y`}
          {...(restProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      )}

      {as === "select" && (
        <div className="relative">
          <select
            id={id}
            disabled={disabled}
            className={`${controlClasses} appearance-none pr-10`}
            {...(restProps as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            {"placeholder" in props && props.placeholder && (
              <option value="" disabled selected hidden>
                {props.placeholder}
              </option>
            )}
            {"options" in props && props.options
              ? props.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : "children" in props
              ? props.children
              : null}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-ink/50">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      )}

      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-ink/60">{helperText}</p>
      ) : null}
    </div>
  );
}