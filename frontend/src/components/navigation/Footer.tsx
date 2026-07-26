export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto border-t bg-card py-4 px-6 text-center lg:text-left transition-colors duration-300">
      <div className="flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
        <div>
          &copy; {currentYear} <span className="font-semibold text-foreground">Kape Uno Bistro</span>. All rights reserved.
        </div>
        <div className="mt-2 md:mt-0 flex gap-4">
          <span>v1.0.0</span>
          <span>Kuventory IMS</span>
        </div>
      </div>
    </footer>
  );
}
