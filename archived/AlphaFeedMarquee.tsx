'use client';
import { useUser } from '@/context/UserContext';
import useAlphaFeedMarqueeData from '@/hooks/data/useAlphaFeedMarqueeData';
import Link from 'next/link';
import Marquee from 'react-fast-marquee';

const AlphaFeedMarquee = () => {
  const { chain } = useUser();
  const { data } = useAlphaFeedMarqueeData(chain.api);

  return (
    <div className="w-full h-7 border rounded-lg border-border">
      <Marquee className=" py-1" pauseOnHover={true}>
        {data &&
          data.map((feed) => {
            return (
              <Link
                key={feed.id}
                href={`/tokens/${feed.address}`}
                className="flex gap-1 items-center px-3 select-none"
              >
                <span className="text-xs font-semibold mt-[2px]">
                  {feed.symbol.toUpperCase()}
                </span>
                {feed.sentiment === 'positive' && (
                  <span className=" bg-positive/30 text-positive w-4 h-4 flex items-center justify-center text-[.6rem] rounded">
                    {feed.mentioned_count}
                  </span>
                )}
                {feed.sentiment === 'negative' && (
                  <span className=" bg-negative/30 text-negative w-4 h-4 flex items-center justify-center text-[.6rem] rounded">
                    {feed.mentioned_count}
                  </span>
                )}
                {feed.sentiment === 'neutral' && (
                  <span className=" bg-neutral-500/30 text-neutral-300 w-4 h-4 flex items-center justify-center text-[.6rem] rounded">
                    {feed.mentioned_count}
                  </span>
                )}
              </Link>
            );
          })}
      </Marquee>
    </div>
  );
};

export default AlphaFeedMarquee;
