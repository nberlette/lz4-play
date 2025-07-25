import { ArrowLeft, Database, Globe, Lock, Server, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const LAST_UPDATED = "July 9, 2025";

export const metadata = {
  title: "Privacy Policy - LZ4 Playground",
  description:
    "Privacy information for the LZ4 Playground. Learn how your data is handled and protected while using this client-side compression tool.",
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Playground
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Your Data Stays in Your Browser</CardTitle>
            </div>
            <CardDescription>
              LZ4 Playground operates entirely client-side, with no server
              processing of your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              <strong>100% Client-Side Processing:</strong>{" "}
              When you use LZ4 Playground to compress or decompress files, all
              processing happens directly in your browser. Your files and data
              never leave your device.
            </p>
            <p>
              When you "upload" a file to compress, you're simply selecting a
              file from your device to be processed by JavaScript running in
              your browser. The file is never transmitted to our servers or
              stored anywhere outside your browser.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Local Storage Only</CardTitle>
            </div>
            <CardDescription>
              How we use browser storage and what data is saved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              LZ4 Playground uses your browser's localStorage to save your
              compression history and preferences. This data is stored only on
              your device and is not accessible to us or any third parties.
            </p>
            <p className="mb-4">Data stored locally includes:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                Compression history (file names, sizes, compression ratios,
                timestamps)
              </li>
              <li>
                Your last used settings (compression mode, selected version)
              </li>
              <li>Performance metrics from your compression operations</li>
            </ul>
            <p>
              You can clear this data at any time by using the "Clear History"
              button in the application or by clearing your browser's
              localStorage through your browser settings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>Shareable Links</CardTitle>
            </div>
            <CardDescription>
              How shared links work and what data they contain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              When you create a shareable link, the compression data is encoded
              directly into the URL. This data is not stored on our servers - it
              exists only in the URL itself.
            </p>
            <p className="mb-4">
              For large files, only the configuration settings (not the actual
              file data) are included in the URL to prevent excessively long
              URLs.
            </p>
            <p>
              <strong>Important:</strong>{" "}
              Be aware that when you share a link, anyone with that link can see
              the data encoded in the URL. Do not share links containing
              sensitive information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <CardTitle>External Services</CardTitle>
            </div>
            <CardDescription>
              Third-party services and resources used by the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              LZ4 Playground loads the LZ4 compression library from JSR
              (JavaScript Registry) at runtime. This is the only external
              resource that the application needs to function.
            </p>
            <p className="mb-4">
              When you select a version of the LZ4 library, your browser will
              download that version from JSR. This request only includes the
              version number you selected, not any of your data or files.
            </p>
            <p>
              We do not use analytics, tracking cookies, or any other monitoring
              tools. There are no advertisements or third-party scripts that
              could collect your data.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>Security Considerations</CardTitle>
            </div>
            <CardDescription>
              Best practices for using this tool securely
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              While we've designed LZ4 Playground to be secure and private,
              there are some general security considerations to keep in mind:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                Keep your browser updated to ensure you have the latest security
                patches and JavaScript protections.
              </li>
              <li>
                Be cautious when compressing sensitive files on shared or public
                computers, as the file data will be loaded into the browser's
                memory.
              </li>
              <li>
                If you're concerned about privacy, consider clearing your
                browser history and local storage after using the application
                with sensitive data.
              </li>
              <li>
                Remember that shareable links may contain your data in the URL -
                only share links with trusted recipients.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="border-t pt-6 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          LZ4 Playground is an open-source project. If you have any questions or
          concerns about privacy, please{" "}
          <a
            href="https://github.com/nberlette/lz4-wasm/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            open an issue on GitHub
          </a>
          .
        </p>
        <p className="text-xs text-muted-foreground">
          This privacy policy is provided for informational purposes only and
          does not constitute legal advice.
        </p>
      </div>
    </div>
  );
}
