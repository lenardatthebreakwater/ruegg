"use client";

import { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getGravatarAvatarUrl } from "@/lib/gravatar";
import { cn } from "@/lib/utils";

const GRAVATAR_SOURCE_TOOLTIP =
  "Vi har hentet bildet ditt fra din offentlige Gravatar-profil.";

type AccountGravatarAvatarProps = {
  email: string;
  /** Accessible name when the photo is shown (Norwegian alt from caller). */
  alt: string;
  className?: string;
};

/**
 * Shows a circular Gravatar only when the customer has published one.
 * Missing avatars (HTTP 404 via d=404) stay hidden — no invented or default face.
 */
export function AccountGravatarAvatar({
  email,
  alt,
  className,
}: AccountGravatarAvatarProps) {
  const src = getGravatarAvatarUrl(email);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );

  if (!src || status === "error") return null;

  const isLoaded = status === "loaded";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar
          key={src}
          tabIndex={isLoaded ? 0 : -1}
          className={cn(
            "size-12 after:border-border/60",
            isLoaded &&
              "cursor-help outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            !isLoaded && "hidden",
            className,
          )}
        >
          <AvatarImage
            src={src}
            alt={alt}
            onLoadingStatusChange={(next) => {
              if (next === "loaded" || next === "error") setStatus(next);
            }}
          />
        </Avatar>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        sideOffset={8}
        className="max-w-[18rem] text-pretty leading-relaxed"
      >
        {GRAVATAR_SOURCE_TOOLTIP}
      </TooltipContent>
    </Tooltip>
  );
}
