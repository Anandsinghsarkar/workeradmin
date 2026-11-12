import './globals.css';

export const metadata = {
  title: 'Worker Admin | Cloudflare Workers Console',
  description: 'A clean, secure and modern dashboard for managing Cloudflare Workers.',
  applicationName: 'Worker Admin',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#070b16',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="bg" aria-hidden="true">
          <span className="orb o1" />
          <span className="orb o2" />
          <span className="orb o3" />
          <span className="grid" />
        </div>
        {children}
      </body>
    </html>
  );
}
