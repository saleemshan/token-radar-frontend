import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import Modal, { BridgeModalMethods, ModalMethods } from './Modal';
import axios from 'axios';
import Image from 'next/image';
import useDebounceWithLoading from '@/hooks/useDebounceWithLoading';
import { TOKEN_PLACEHOLDER_IMAGE } from '@/utils/image';
import {
  BridgeSelectTarget,
  BridgeSelectType,
  RelayChain,
  RelayToken,
} from '@/types/bridge';

interface BridgeChainTokenModalProps {
  chainList: RelayChain[];
  setFromChain: React.Dispatch<React.SetStateAction<RelayChain | undefined>>;
  setToChain: React.Dispatch<React.SetStateAction<RelayChain | undefined>>;
  fromChain: RelayChain | undefined;
  toChain: RelayChain | undefined;
  setFromToken: React.Dispatch<React.SetStateAction<RelayToken | undefined>>;
  setToToken: React.Dispatch<React.SetStateAction<RelayToken | undefined>>;
}

const BridgeChainTokenModal = forwardRef<
  BridgeModalMethods,
  BridgeChainTokenModalProps
>(
  (
    {
      chainList: initialChainList,
      setFromChain,
      setToChain,
      setFromToken,
      setToToken,
      toChain,
      fromChain,
    },
    ref,
  ) => {
    const modalRef = React.createRef<ModalMethods>();
    const [selectType, setSelectType] = useState<BridgeSelectType>('chain');
    const [selectTarget, setSelectTarget] =
      useState<BridgeSelectTarget>('from');
    const [chainList, setChainList] = useState<RelayChain[]>(initialChainList);
    const [selectedChain, setSelectedChain] = useState<RelayChain | undefined>(
      undefined,
    );
    const [filteredchainList, setFilteredChainList] = useState<RelayChain[]>(
      [],
    );
    const [searchChainInput, setSearchChainInput] = useState('');
    const [searchTokenInput, setSearchTokenInput] = useState('');

    const [debouncedSearchTokenInput, isDebouncing] = useDebounceWithLoading(
      searchTokenInput,
      1000,
    );
    const [tokenList, setTokenList] = useState<RelayToken[]>([]);
    const [isTokenLoading, setIsTokenLoading] = useState(false);

    const handleToggleModal = useCallback(
      (selectTarget: BridgeSelectTarget, selectType?: BridgeSelectType) => {
        if (selectType) setSelectType(selectType);
        if (selectTarget) setSelectTarget(selectTarget);
        modalRef.current?.toggleModal();
      },
      [modalRef],
    );

    useEffect(() => {
      console.log({ chainList });
    }, [chainList]);

    const handleSelectChain = (chain: RelayChain) => {
      if (selectType === 'chain') {
        if (selectTarget === 'from') {
          setFromChain(chain);
          setFromToken(undefined);
        } else {
          setToChain(chain);
          setToToken(undefined);
        }
        modalRef.current?.toggleModal();
      } else {
        setSearchTokenInput('');
        setSelectedChain(chain);
      }
    };

    const handleSelectToken = (token: RelayToken) => {
      setFromChain(selectedChain);
      if (selectTarget === 'from') {
        setFromToken(token);
      } else {
        setToToken(token);
      }
      modalRef.current?.toggleModal();
    };

    useImperativeHandle(ref, () => ({
      toggleModal: (
        selectTarget: BridgeSelectTarget,
        selectType?: BridgeSelectType,
      ) => handleToggleModal(selectTarget, selectType),
    }));

    useEffect(() => {
      if (selectType === 'token') {
        if (selectTarget === 'from') {
          if (fromChain) setSelectedChain(fromChain);
        } else {
          if (toChain) setSelectedChain(toChain);
        }
      }
    }, [toChain, fromChain, selectTarget, selectType]);

    useEffect(() => {
      if (selectType === 'chain') return;
      if (isDebouncing) return;

      const getTokens = async () => {
        setIsTokenLoading(true);
        const response = await axios.get('/api/relay/currencies', {
          params: {
            chainIds: selectedChain?.id,
            term: debouncedSearchTokenInput,
            defaultList: true,
            limit: 20,
            depositAddressOnly: false,
          },
        });
        // console.log(response.data);
        setIsTokenLoading(false);
        if (response.data.data && response.data.data.length > 0) {
          const tokens: RelayToken[] = [];
          response.data.data.forEach((element: RelayToken[]) => {
            if (element.length > 0) {
              element.forEach((element: RelayToken) => {
                tokens.push(element);
              });
            }
          });

          setTokenList(tokens);
        }
      };

      getTokens();
    }, [selectedChain, debouncedSearchTokenInput, selectType, isDebouncing]);

    useEffect(() => {
      const newFilteredChainList = chainList.filter((chain) => {
        return chain.displayName
          .toLowerCase()
          .includes(searchChainInput.toLowerCase());
      });

      setFilteredChainList(newFilteredChainList);
    }, [searchChainInput, chainList]);

    console.log(initialChainList, 'initialChainList');

    useEffect(() => {
      setChainList(initialChainList);
      setFilteredChainList(initialChainList);
    }, [initialChainList]);

    return (
      <Modal ref={modalRef}>
        <div
          className={` ${
            selectType === 'token' ? 'max-w-2xl' : 'max-w-sm'
          } bg-black border border-border rounded-lg overflow-hidden flex flex-col w-full max-h-[50vh] min-h-[50vh] `}
        >
          <div className="p-3 flex border-b border-border items-center bg-black">
            <div className=" text-base font-semibold leading-6 text-white flex-1 ">
              Select {selectType}
            </div>
          </div>

          <div className="flex h-full overflow-hidden flex-1">
            <div
              className={`border-r border-border ${
                selectType === 'token'
                  ? ' min-w-32 max-w-32 md:min-w-48 md:max-w-48'
                  : ' w-full'
              }`}
            >
              <input
                type="text"
                placeholder="Search Chain"
                className="w-full  p-3 focus:outline-none text-neutral-text bg-black hover:bg-table-odd border-b border-border focus:bg-neutral-900 text-base md:text-sm "
                onChange={(e) => {
                  setSearchChainInput(e.target.value);
                }}
              />
              <div className="flex flex-col p-1 bg-black overflow-y-auto h-full ">
                {filteredchainList &&
                  filteredchainList.length > 0 &&
                  filteredchainList.map((chain) => {
                    return (
                      <button
                        key={chain.id}
                        className={`w-full p-1 h-8 min-h-8 px-2 flex items-center gap-2 hover:bg-table-odd apply-transition text-left rounded-lg ${
                          selectedChain?.id === chain.id ? 'bg-neutral-900' : ''
                        }`}
                        type="button"
                        onClick={() => {
                          handleSelectChain(chain);
                        }}
                      >
                        <div
                          className={`rounded-full border border-border bg-neutral-900 overflow-hidden relative flex items-center justify-center min-w-7 min-h-7 max-w-7 max-h-7`}
                        >
                          <Image
                            src={
                              chain.id
                                ? `https://assets.relay.link/icons/square/${chain.id}/dark.png`
                                : TOKEN_PLACEHOLDER_IMAGE
                            }
                            alt={`${chain.displayName} logo`}
                            width={100}
                            height={100}
                            className=" w-full h-full object-cover object-center"
                          />
                        </div>
                        <span> {chain.displayName}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
            {selectType === 'token' && (
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search Token"
                  value={searchTokenInput}
                  className="w-full  p-3 focus:outline-none text-neutral-text bg-black hover:bg-table-odd border-b border-border focus:bg-neutral-900 text-base md:text-sm "
                  onChange={(e) => {
                    setSearchTokenInput(e.target.value);
                  }}
                />
                <div className="overflow-y-auto h-full flex flex-col  p-1">
                  {isTokenLoading ? (
                    <div className="flex flex-col gap-2 p-2">
                      {[...Array(10)].map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 animate-pulse"
                        >
                          <div className="w-7 h-7 rounded-full bg-neutral-800"></div>
                          <div className="h-4 w-24 bg-neutral-800 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    tokenList.map((token) => {
                      return (
                        <button
                          key={token.address}
                          className={`w-full p-1 h-10 min-h-10 px-2 flex items-center gap-2 hover:bg-table-odd apply-transition text-left rounded-lg`}
                          type="button"
                          onClick={() => {
                            handleSelectToken(token);
                          }}
                        >
                          <div
                            className={` rounded-full border border-border bg-neutral-900 overflow-hidden relative flex items-center justify-center min-w-7 min-h-7 max-w-7 max-h-7`}
                          >
                            <Image
                              src={
                                token?.metadata?.logoURI ??
                                TOKEN_PLACEHOLDER_IMAGE
                              }
                              alt={`${token.name} logo`}
                              width={100}
                              height={100}
                              className=" w-full h-full object-cover object-center"
                            />
                          </div>
                          <span> {token.name}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    );
  },
);

BridgeChainTokenModal.displayName = 'BridgeChainTokenModal';

export default BridgeChainTokenModal;
