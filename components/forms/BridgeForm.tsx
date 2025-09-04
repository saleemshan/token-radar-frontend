'use client';
import DecimalInput from '@/components/input/DecimalInput';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { FaChevronDown, FaWallet } from 'react-icons/fa6';
import BridgeChainTokenModal from '../modal/BridgeChainTokenModal';
import Image from 'next/image';
import { TOKEN_PLACEHOLDER_IMAGE } from '@/utils/image';
import { LuArrowLeftRight } from 'react-icons/lu';
import {
  BridgeSelectTarget,
  BridgeSelectType,
  RelayChain,
  RelayToken,
} from '@/types/bridge';

const BridgeForm = () => {
  const [chainList, setChainList] = useState<RelayChain[]>([]);
  const bridgeChainTokenModalRef = useRef<{
    toggleModal: (
      selectTarget: BridgeSelectTarget,
      selectType?: BridgeSelectType,
    ) => void;
  }>(null);

  const [fromChain, setFromChain] = useState<undefined | RelayChain>(undefined);
  const [toChain, setToChain] = useState<undefined | RelayChain>(undefined);
  const [fromToken, setFromToken] = useState<undefined | RelayToken>(undefined);
  const [fromInput, setFromInput] = useState('0');
  const [toInput, setToInput] = useState('0');
  const [toToken, setToToken] = useState<undefined | RelayToken>(undefined);

  const handleSwap = () => {
    const tempFromChain = fromChain;
    const tempFromToken = fromToken;
    const tempFromInput = fromInput;

    setFromChain(toChain);
    setFromToken(toToken);
    setFromInput(toInput);

    setToChain(tempFromChain);
    setToToken(tempFromToken);
    setToInput(tempFromInput);
  };

  useEffect(() => {
    const getChains = async () => {
      const response = await axios.get('/api/bridge/chains');

      if (
        response.data &&
        response.data.chains &&
        response.data.chains.length > 0
      ) {
        setChainList(response.data.chains);
      }
    };

    getChains();
  }, []);

  return (
    <div className="flex flex-col w-full gap-3">
      <div className="flex flex-col w-full relative">
        <button
          type="button"
          onClick={handleSwap}
          className="absolute translate-x-1/2 right-1/2 translate-y-1/2 bottom-1/2 w-10 h-10 bg-table-odd border-border border flex items-center justify-center rounded-md text-neutral-text-dark hover:text-neutral-text hover:bg-neutral-900  apply-transition"
        >
          <LuArrowLeftRight className="rotate-90 text-lg" />
        </button>
        <div className="flex flex-col w-full border border-border rounded-lg gap-2 py-2 bg-[#0f0f0f]">
          <div className="flex flex-col  px-2   gap-1">
            <div className="text-sm font-medium pb-2">From</div>
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => {
                  bridgeChainTokenModalRef.current?.toggleModal(
                    'from',
                    'chain',
                  );
                }}
                className="border border-border rounded-lg p-2 flex gap-2 items-center w-full min-h-12"
              >
                <div>{fromChain ? fromChain?.displayName : 'Select Chain'}</div>
                <div className="ml-auto">
                  <FaChevronDown className=" text-neutral-text-dark text-[9px]" />
                </div>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mx-2 relative">
            <DecimalInput
              onChange={(e) => {
                setFromInput(e.target.value);
              }}
              value={fromInput}
              className=" text-left h-full w-full  bg-transparent text-4xl font-semibold"
            />
            <div className="flex flex-col gap-1 items-end">
              <button
                type="button"
                onClick={() => {
                  bridgeChainTokenModalRef.current?.toggleModal(
                    'from',
                    'token',
                  );
                }}
                className="border border-border rounded-lg p-2 flex gap-2 items-center whitespace-nowrap"
              >
                {fromToken ? (
                  <>
                    <div
                      className={` rounded-full border border-border bg-neutral-900 overflow-hidden relative flex items-center justify-center min-w-7 min-h-7 max-w-7 max-h-7`}
                    >
                      <Image
                        src={
                          fromToken?.metadata?.logoURI ??
                          TOKEN_PLACEHOLDER_IMAGE
                        }
                        alt={`${fromToken?.name} logo`}
                        width={100}
                        height={100}
                        className=" w-full h-full object-cover object-center"
                      />
                    </div>
                    <span> {fromToken ? fromToken?.name : ''}</span>
                  </>
                ) : (
                  <div> Select Token</div>
                )}

                <div className="ml-auto">
                  <FaChevronDown className=" text-neutral-text-dark text-[9px]" />
                </div>
              </button>
              <div className="flex items-center gap-1 text-neutral-text-dark">
                <FaWallet className="text-2xs" />
                <div className="text-xs ">0</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full border border-border rounded-lg gap-2 py-2 bg-[#0f0f0f] -mt-[1px]">
          <div className="flex flex-col  px-2   gap-1">
            <div className="text-sm font-medium pb-2">To</div>
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => {
                  bridgeChainTokenModalRef.current?.toggleModal('to', 'chain');
                }}
                className="border border-border rounded-lg p-2 flex gap-2 items-center w-full min-h-12"
              >
                <div>{toChain ? toChain?.displayName : 'Select Chain'}</div>
                <div className="ml-auto">
                  <FaChevronDown className=" text-neutral-text-dark text-[9px]" />
                </div>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mx-2 relative">
            <DecimalInput
              onChange={(e) => {
                setToInput(e.target.value);
              }}
              value={toInput}
              className=" text-left h-full w-full  bg-transparent text-4xl font-semibold"
            />
            <div className="flex flex-col gap-1 items-end">
              <button
                type="button"
                onClick={() => {
                  bridgeChainTokenModalRef.current?.toggleModal('to', 'token');
                }}
                className="border border-border rounded-lg p-2 flex gap-2 items-center whitespace-nowrap"
              >
                {toToken ? (
                  <>
                    <div
                      className={` rounded-full border border-border bg-neutral-900 overflow-hidden relative flex items-center justify-center min-w-7 min-h-7 max-w-7 max-h-7`}
                    >
                      <Image
                        src={
                          toToken?.metadata?.logoURI ?? TOKEN_PLACEHOLDER_IMAGE
                        }
                        alt={`${toToken?.name} logo`}
                        width={100}
                        height={100}
                        className=" w-full h-full object-cover object-center"
                      />
                    </div>
                    <span> {toToken ? toToken?.name : ''}</span>
                  </>
                ) : (
                  <div> Select Token</div>
                )}

                <div className="ml-auto">
                  <FaChevronDown className=" text-neutral-text-dark text-[9px]" />
                </div>
              </button>
              <div className="flex items-center gap-1 text-neutral-text-dark">
                <FaWallet className="text-2xs" />
                <div className="text-xs ">0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 text-neutral-text bg-table-odd hover:bg-neutral-900 border border-border focus:bg-neutral-900  apply-transition font-semibold  rounded-lg p-3 uppercase tracking-wide "
      >
        SWAP
      </button>

      <BridgeChainTokenModal
        ref={bridgeChainTokenModalRef}
        chainList={chainList}
        fromChain={fromChain}
        toChain={toChain}
        setFromChain={setFromChain}
        setToChain={setToChain}
        setFromToken={setFromToken}
        setToToken={setToToken}
      />
    </div>
  );
};

export default BridgeForm;
