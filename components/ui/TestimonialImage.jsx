"use client";

import Image from "next/image";
import { useState } from "react";

export default function TestimonialImage({ src, alt }) {
  const [imageSrc, setImageSrc] = useState(
    src || "/default-avatar.png"
  );

  return (
    <div className="relative h-12 w-12 shrink-0">
      {/* Retro offset shadow */}
      <div className="absolute left-1 top-1 h-12 w-12 rounded-full border-2 border-black bg-[#f4c95d]" />

      {/* Avatar frame */}
      <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-black bg-[#d7f6e7]">
        <Image
          src={imageSrc}
          alt={alt || "User avatar"}
          width={48}
          height={48}
          className="h-full w-full object-cover"
          onError={() => {
            setImageSrc("/default-avatar.png");
          }}
        />
      </div>

      {/* Online/accent dot */}
      <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-black bg-[#18a66a]" />
    </div>
  );
}