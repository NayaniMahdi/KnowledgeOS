import type { Metadata } from "next";
import "./globals.css";
import { KnowledgeProvider } from "@/context/knowledge-context";
import { CitationInspector } from "@/components/chat/citation-inspector";

export const metadata: Metadata = {
  title: "KnowledgeOS — Private Company Knowledge Assistant",
  description:
    "Intelligent enterprise assistant powered by retrieval-augmented generation (RAG) over approved internal company documentation.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-foreground selection:text-background relative overflow-x-hidden">
        {/* Background Wallpaper Container with Subtle Blur & Dual Theme */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
          {/* Light Mode Wallpaper: Apple Studio Light Flow */}
          <div 
            className="absolute -inset-1 bg-cover bg-center bg-no-repeat transition-opacity duration-700 opacity-100 dark:opacity-0 filter blur-[2px] scale-[1.01]"
            style={{ backgroundImage: `url('/wallpaper-light.jpg')` }}
          />
          {/* Dark Mode Wallpaper: Apple Pitch Obsidian Wave */}
          <div 
            className="absolute -inset-1 bg-cover bg-center bg-no-repeat transition-opacity duration-700 opacity-0 dark:opacity-90 filter blur-[2px] scale-[1.01]"
            style={{ backgroundImage: `url('/wallpaper-dark.jpg')` }}
          />
          {/* Ambient Tone & Frosted Vignette Layer */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/15 to-white/40 dark:from-black/40 dark:via-black/60 dark:to-black/80 transition-colors duration-500" 
          />
        </div>

        <div className="relative z-10">
          <KnowledgeProvider>
            {children}
            <CitationInspector />
          </KnowledgeProvider>
        </div>
      </body>
    </html>
  );
}
