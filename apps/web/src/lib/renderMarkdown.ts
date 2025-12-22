"use client";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";

import rehypeHighlight from "rehype-highlight";
import cpp from "highlight.js/lib/languages/cpp";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import java from "highlight.js/lib/languages/java";
import css from "highlight.js/lib/languages/css";
import html from "highlight.js/lib/languages/xml";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";

export async function renderMarkdown(markdown: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeKatex)
    .use(rehypeHighlight, {
      // Register languages
      languages: {
        cpp,
        c: cpp, // alias
        "c++": cpp, // alias
        javascript,
        js: javascript, // alias
        typescript,
        ts: typescript, // alias
        python,
        py: python, // alias
        java,
        css,
        html,
        xml: html, // alias
        json,
        bash,
        sh: bash, // alias
        sql,
      },
      // Ignore missing languages instead of throwing
      ignoreMissing: true,
    })
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}
