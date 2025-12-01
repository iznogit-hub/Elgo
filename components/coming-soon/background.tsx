"use client";

export function Background() {
  return (
    <div className="fixed inset-0 -z-50 h-full w-full overflow-hidden bg-background">
      {/* UPDATED GRID LOGIC:
                We use 'bg-[linear-gradient(...)]' but applied via a class that respects 
                Tailwind's theme opacity. 
                
                The specific fix:
                - Light Mode: The lines need to be darker (black/10)
                - Dark Mode: The lines need to be lighter (white/10)
                
                We use the 'dark:' modifier to switch the gradient string.
            */}
      <div
        className="absolute inset-0 h-full w-full 
                bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)]
                dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)]
                bg-size-[40px_40px] 
                mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
      />

      {/* Film Grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay">
        <div
          className="absolute inset-0 h-full w-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="absolute left-0 right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px] opacity-20 mx-auto" />
    </div>
  );
}
