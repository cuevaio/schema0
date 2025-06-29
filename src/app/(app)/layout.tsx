import Link from "next/link";
import { DatabaseSchemaSelector } from "@/components/database-schema-selector";
import { buttonVariants } from "@/components/ui/button";
import { GithubIcon } from "@/components/ui/icons/github";
import { UploadDatabase } from "@/components/upload-database";
import { User } from "@/components/user";

export default function DatabaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 pb-8">
      <div className="sticky top-0 z-10 flex items-start justify-between bg-background py-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
              <div className="font-bold text-primary-foreground text-xl">
                s0
              </div>
            </div>
          </Link>
          <DatabaseSchemaSelector />
          <UploadDatabase />
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/cuevaio/schema0"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <GithubIcon
              className="size-4 text-muted-foreground"
              fill="currentColor"
            />
          </a>
          <User />
        </div>
      </div>
      {children}
      <p className="mt-8 text-center text-muted-foreground text-sm">
        made with ❤️ by cursor and{" "}
        <a
          href="https://cueva.io"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          cueva.io
        </a>
      </p>
    </div>
  );
}
