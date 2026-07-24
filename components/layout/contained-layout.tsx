import { cn } from "@/lib/utils";

type ContainedLayoutProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "main" | "section" | "header";
};

export function ContainedLayout({
  children,
  className,
  as: Comp = "div",
}: ContainedLayoutProps) {
  return (
    <Comp
      className={cn(
        "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </Comp>
  );
}
