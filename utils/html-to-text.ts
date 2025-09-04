// import { JSDOM } from 'jsdom';
// import hljs from 'highlight.js/lib/core';
// import javascript from 'highlight.js/lib/languages/javascript';
// import xml from 'highlight.js/lib/languages/xml';
// import html from 'highlight.js/lib/languages/xml';
// import css from 'highlight.js/lib/languages/css';

// // Register the languages with highlight.js
// hljs.registerLanguage('javascript', javascript);
// hljs.registerLanguage('xml', xml);
// hljs.registerLanguage('html', html);
// hljs.registerLanguage('css', css);

// export async function extractMainContent(
//   url: string,
//   htmlContent: string,
// ): Promise<string> {
//   try {
//     const dom = new JSDOM(htmlContent, { url });
//     const document = dom.window.document;

//     // Get all text content
//     let textContent = document.body.textContent || '';

//     // Split lines on colons, semicolons, and closing tags
//     textContent = textContent
//       // eslint-disable-next-line no-useless-escape
//       .split(/[:;.\/>]/)
//       .map((line) => {
//         line = line.trim();

//         // Remove multiple spaces
//         line = line.replace(/\s\s+/g, ' ');

//         if (line.length > 200) {
//           return line.match(/.{1,200}/g)?.join('\n') || line;
//         }
//         return line;
//       })
//       .filter(
//         (() => {
//           const seenLines = new Set<string>();
//           // Use a Set to filter out duplicates efficiently
//           return (line) => {
//             if (line.length === 0) return false; // Skip empty lines
//             if (seenLines.has(line)) return false; // Skip duplicate lines
//             seenLines.add(line);
//             return true;
//           };
//         })(),
//       )
//       .join('\n');

//     // Filter out content that looks like code using highlight.js
//     textContent = textContent
//       .split('\n')
//       .filter((line) => !isCodeLine(line))
//       .join('\n');

//     // Ensure the length is within limits
//     if (textContent.length > 50000) {
//       textContent = textContent.slice(0, 50000);
//     }

//     return textContent;
//   } catch (error) {
//     throw new Error(`Error parsing content: ${(error as Error).message}`);
//   }
// }
// export function isCodeLine(line: string): boolean {
//   // If the line is empty or very short, it's likely not code
//   if (line.trim().length === 0 || line.length < 5) {
//     return false;
//   }

//   // Detect the language using highlight.js
//   const result = hljs.highlightAuto(line, ['javascript', 'xml', 'html', 'css']);
//   const detectedLanguage = result.language;

//   // If the detected language is CSS, check for specific characters
//   if (detectedLanguage === 'css') {
//     return line.includes('{') || line.includes('}') || line.includes(':');
//   }

//   // Consider it as code if it detects as a common web language
//   return (
//     detectedLanguage === 'javascript' ||
//     detectedLanguage === 'xml' ||
//     detectedLanguage === 'html' ||
//     detectedLanguage === 'css'
//   );
// }
