'use client';
import React, { useState } from 'react';
import Spinner from '../Spinner';

import { FaChevronDown, FaCircleInfo } from 'react-icons/fa6';

import Tooltip from '../Tooltip';
import useTokenTwitterRecycleData from '@/hooks/data/useTwitterRecycleData';

const TwitterRecyclePanel = ({
  tokenData,
  twitterId,
}: {
  tokenData: Token | undefined;
  twitterId: string | undefined;
}) => {
  const { data, isLoading } = useTokenTwitterRecycleData(twitterId);

  const [showDetails, setShowDetails] = useState(false);
  return (
    <div className=" w-full flex flex-col gap-2 overflow-hidden min-h-fit bg-black relative rounded-lg">
      <div className=" flex-1 flex flex-col border border-border rounded-lg h-full bg-black overflow-y-hidden overflow-x-auto">
        <button
          className={`flex  p-3 border-border gap-3  flex-wrap justify-between text-white text-base items-center ${
            showDetails ? ' border-b' : ''
          }`}
          onClick={() => {
            setShowDetails(!showDetails);
          }}
        >
          <div className=" leading-6  flex-1 bg-black font-semibold text-left text-sm flex items-center gap-2">
            <div>Twitter Recycle</div>
            <Tooltip text="Check whether the Twitter account has been recycled or reused">
              <FaCircleInfo className="text-2xs text-neutral-text-dark" />
            </Tooltip>
          </div>

          {!tokenData ? (
            <Spinner />
          ) : twitterId ? (
            <span className="text-xs">
              {data?.length}{' '}
              {data && data?.length > 0
                ? data?.length > 1
                  ? 'times'
                  : 'time'
                : ''}
            </span>
          ) : (
            <span className="text-xs"> No Twitter Handle</span>
          )}

          <FaChevronDown
            className={`apply-transition text-2xs text-neutral-text-dark ${
              showDetails ? 'rotate-180' : ''
            } `}
          />
        </button>

        {showDetails && (
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="flex flex-col overflow-hidden text-xs text-neutral-text p-3">
              <div className=" flex flex-col gap-1 h-full overflow-y-auto ">
                {!isLoading &&
                  data &&
                  data.length > 0 &&
                  data.map((data, index) => {
                    return <div key={index}>{data}</div>;
                  })}

                {!data ||
                  (data.length <= 0 && <span>No data is available.</span>)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwitterRecyclePanel;
