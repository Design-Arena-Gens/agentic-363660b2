import "./globals.css";

export const metadata = {
  title: "WhatsApp Name Sender",
  description: "Type a name and send a WhatsApp message via wa.me"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
