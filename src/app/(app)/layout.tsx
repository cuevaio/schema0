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
    <div className="container mx-auto p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
              <div className="font-bold text-primary-foreground text-xl">
                s0
              </div>
            </div>
          </Link>
          <DatabaseSchemaSelector />
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
        </div>
        <div className="flex items-center gap-4">
          <UploadDatabase />
          <User />
        </div>
      </div>
      {children}
      <p className="text-center text-muted-foreground text-sm">
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
