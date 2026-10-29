import type { Metadata } from "next";
import "./globals.css";
import { KnowledgeProvider } from "@/context/knowledge-context";
import { CitationInspector } from "@/components/chat/citation-inspector";

export const metadata: Metadata = {
  title: "KnowledgeOS — Private Company Knowledge Assistant",
  description:
    "Intelligent enterprise assistant powered by retrieval-augmented generation (RAG) over approved internal company documentation.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-accent-subtle selection:text-accent">
        <KnowledgeProvider>
          {children}
          <CitationInspector />
        </KnowledgeProvider>
      </body>
    </html>
  );
}
