export function Footer() {
  return (
    <footer className="mt-auto border-t bg-card py-4 px-6 text-center lg:text-left transition-colors duration-300">
      <div className="flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
        <div>
          &copy; 2026 <span className="font-semibold text-foreground">Kuventory</span>. Built for Kape Uno Bistro.
        </div>
        <div className="mt-2 md:mt-0 flex gap-4">
          <span>Version 1.3.0</span>
          <span>Kuventory</span>
        </div>
      </div>
    </footer>
  );
}
