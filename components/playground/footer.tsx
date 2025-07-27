import { Github, Package, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 mb-8 border-t pt-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <p>
              &copy; {currentYear}{" "}
              <a
                href="https://github.com/nberlette"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:underline"
              >
                Nicholas Berlette
              </a>
              . All rights reserved.{" "}
              <a
                href="https://github.com/nberlette/lz4-wasm/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:underline"
              >
                MIT License
              </a>
              .
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2 transition-colors duration-500"
            >
              <a
                href="https://github.com/nberlette/lz4-wasm#readme"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2 transition-colors duration-500"
            >
              <a
                href="https://jsr.io/@nick/lz4"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Package className="h-4 w-4" />
                <span>JSR</span>
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2 transition-colors duration-500"
            >
              <Link href="/privacy">
                <Shield className="h-4 w-4" />
                <span>Privacy</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="my-8 text-xs text-center text-muted-foreground opacity-75 italic">
          <p>
            Not affiliated with nor endorsed by the official{" "}
            <a
              href="https://github.com/lz4/lz4"
              target="_blank"
              rel="noopener noreferrer"
            >
              LZ4
            </a>{" "}
            project, a trademark of{" "}
            <a
              href="https://github.com/Cyan4973"
              target="_blank"
              rel="noopener noreferrer"
              title="Yann Collet on GitHub - Cyan4973"
            >
              Yann Collet
            </a>
            .
          </p>
          <p className="mt-2">
            <strong>100% client-side processing</strong>{" "}
            - your data never leaves your browser.{" "}
            <Link href="/privacy" className="underline">
              Learn more
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
