'use client';
import useIsMobile from '@/hooks/useIsMobile';
import { getTokenImage } from '@/utils/image';
import { isValidTokenAddress } from '@/utils/string';
import { getTokenUrl } from '@/utils/url';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';

const ClipboardMonitor = () => {
  const previousClipboard = useRef(''); // Store the previous clipboard content
  const pollingInterval = useRef(null); // Store the interval ID
  const [targetToken, setTargetToken] = useState<Token | undefined>(undefined);
  const isMobile = useIsMobile();
  const [isDocumentFocused, setIsDocumentFocused] = useState(true); // Track document focus state

  const readClipboard = async () => {
    if (!isDocumentFocused) return; // Do not read clipboard if document is not focused

    try {
      const text = await navigator.clipboard.readText();
      if (text !== previousClipboard.current) {
        previousClipboard.current = text;

        // Determine if the clipboard content is a token address
        const validTokenAddress = isValidTokenAddress(text);

        if (validTokenAddress) {
          const response = await axios.get(
            `/api/all/tokens/search?query=${text}`,
          );

          const arrayOfTokens = response.data.data;

          if (arrayOfTokens && arrayOfTokens.length > 0) {
            const targetToken = arrayOfTokens[0];

            setTargetToken(targetToken);
          }
        }
      }
    } catch (err) {
      if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') {
        // console.error('Failed to read clipboard contents: ', err);
      }
    }
  };

  useEffect(() => {
    // Handle copy events within the page
    const handleCopy = async () => {
      if (isMobile) return;
      await readClipboard();
    };

    // Start polling the clipboard
    pollingInterval.current = setInterval(
      readClipboard,
      1000,
    ) as unknown as null; // Check every 1 second

    // Add event listener for copy events
    document.addEventListener('copy', handleCopy);

    // Read initial clipboard content
    readClipboard();

    // Handle document focus and blur events
    const handleFocus = () => {
      setIsDocumentFocused(true);
      readClipboard(); // Read clipboard when document gains focus
    };

    const handleBlur = () => {
      setIsDocumentFocused(false);
    };

    document.addEventListener('focus', handleFocus, { capture: true });
    document.addEventListener('blur', handleBlur, { capture: true });

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('focus', handleFocus, { capture: true });
      document.removeEventListener('blur', handleBlur, { capture: true });
      if (pollingInterval.current) clearInterval(pollingInterval.current); // Clear the interval
    };
  }, [isMobile]);

  if (!isMobile && targetToken)
    return (
      <Link
        href={getTokenUrl(targetToken.chain_id, targetToken.address, false)}
        className="flex min-w-fit items-center ml-auto gap-2 border border-border rounded-lg overflow-hidden py-1 px-[6px] h-9 min-h-9 bg-table-odd hover:bg-neutral-900  apply-transition"
      >
        <div className="min-w-6 min-h-6 max-w-6 max-h-6 relative flex items-center justify-center gap-2 rounded-md overflow-hidden">
          <Image
            src={`${getTokenImage(targetToken)}`}
            alt={`${targetToken.name} logo`}
            width={100}
            height={100}
            className=" w-full h-full object-center object-contain"
          />
        </div>
        <div>{targetToken.symbol}</div>
      </Link>
    );
};

export default ClipboardMonitor;
