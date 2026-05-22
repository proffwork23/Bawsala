export function SiteFooter() {
  return (
    <footer className="mt-12">
      <div className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl px-5 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-sm leading-loose text-soul-fg/60 dark:text-white/60 sm:text-right">
              منصة بوصلة — جميع الحقوق محفوظة &copy; {new Date().getFullYear()}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <a
                className="text-soul-fg/80 hover:text-soul-fg dark:text-white/80 dark:hover:text-white transition"
                href="https://wa.me/201555394289"
                target="_blank"
                rel="noreferrer"
              >
                واتساب
              </a>
              <a
                className="text-soul-fg/80 hover:text-soul-fg dark:text-white/80 dark:hover:text-white transition"
                href="mailto:khalidmustafaanwar@gmail.com"
              >
                البريد
              </a>
              <a
                className="text-soul-fg/80 hover:text-soul-fg dark:text-white/80 dark:hover:text-white transition"
                href="https://www.facebook.com/khalidpr1"
                target="_blank"
                rel="noreferrer"
              >
                فيسبوك
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

