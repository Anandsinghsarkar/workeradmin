import './globals.css';

export const metadata = {
  title: 'CF Manager',
  description: 'Cloudflare Workers manager',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#eef4ff',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="bg" aria-hidden="true">
          <span className="orb o1" />
          <span className="orb o2" />
          <span className="orb o3" />
        </div>
        {children}
      </body>
    </html>
  );
}
