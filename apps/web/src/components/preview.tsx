"use client";

export default function Preview({ html }: { html: string }) {
  return (
    <div
      className="prose prose-lg max-w-none p-6 bg-white text-black overflow-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}