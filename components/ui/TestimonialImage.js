"use client";
import Image from "next/image";
import { useState, useEffect } from "react";


export default function TestimonialImage({ src, alt }) {
  const [imageSrc, setImageSrc] = useState(src || "/default-avatar.png");

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => setImageSrc(src);
    img.onerror = () => setImageSrc("/default-avatar.png");
  }, [src]);

  return <Image src={imageSrc} alt={alt} width={40} height={40} className="rounded-full" />;
}

