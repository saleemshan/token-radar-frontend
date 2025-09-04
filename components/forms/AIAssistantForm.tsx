import React, { useEffect, useRef, useState } from 'react';
import { FaPaperPlane, FaUser } from 'react-icons/fa6';
import { aiAssistantChatData } from '@/data/dummy/aiassistant';
import Image from 'next/image';
import { useLogin, usePrivy } from '@privy-io/react-auth';
import ReactMarkdown from 'react-markdown';
import { generateRandomId, unescapeString } from '@/utils/string';
import Spinner from '../Spinner';
import ChatLoading from '../ChatLoading';
import useIsMobile from '@/hooks/useIsMobile';
import { usePathname } from 'next/navigation';

const AIAssistantForm = ({
  selectedPlugin,
}: {
  selectedPlugin?: AIAssistantPlugin;
}) => {
  const { login: handleSignIn } = useLogin();
  const { authenticated, ready, getAccessToken } = usePrivy();
  const isMobile = useIsMobile();
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [showAnalyzeButton, setShowAnalyzeButton] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateRandomId(),
      type: 'ai',
      avatar: `${process.env.basePath}/images/brand/logo.svg`,
      name: 'Crush',
      content:
        'Hi, Im Crush AI, your intelligent crypto concierge! I make it easy for you to analyse digital assets online using natural language. How can I help you today? ',
    },
    // {
    //   id: 'Bj6cHpMNyz',
    //   type: 'ai',
    //   avatar: '/images/brand/logo.svg',
    //   name: 'Crush',
    //   content:
    //     '**💵 Token Info** \n |——Token Name (symbol): sora labs (sora)\n|——Chain: Solana\n|——CA: 89nnWMkWeF9LSJvAWcN2JFQfeWdDk6diKEckeToEU1hE\n|——Market Cap | FDV: $12.51M\n|——Price: $0.01256\n|——Liquidity: $584,772.48\n|——Technical Analysis: The price shows significant volatility with resistance at $0.014, indicating potential for fluctuating trends.\n\n**📢 Social Sentiment Analysis**\n<br />\n|— Positive 60% | Neutral 20% | Negative 20%\n|— The sentiment on Twitter regarding the sora labs token appears to be quite positive. Here are some key points from recent tweets:\n|—— $SORA is expected to be released on CEX soon.\n|—— A wallet turned $400 into over $215,000 with $SORA.\n|—— $SORA is anticipated to do impressive numbers.\n|—— The market cap hit 8.8M shortly after launch.\n|— Overall: The sentiment is largely positive, with excitement about potential growth and exchange listings.\n\n**⚠ Safety**\n|——Renounced❌ LP Burnt✅ Not Honeypot✅ Open-source✅ \n|——Potential Issues: None identified\n|——Contract Verified: Yes\n\n**📲 Links**\n|—— [DexScreener](https://dexscreener.com/solana/89nnWMkWeF9LSJvAWcN2JFQfeWdDk6diKEckeToEU1hE)\n\n[Chart](https://dexscreener.com/solana/89nnWMkWeF9LSJvAWcN2JFQfeWdDk6diKEckeToEU1hE)\n\nIf you need more information or have any questions, feel free to ask!\n\n ',
    // },
  ]);

  // useEffect(() => {
  //   console.log({ messages });
  // }, [messages]);

  const pathname = usePathname();

  // useEffect(() => {

  //   // / = trending table
  //   // /new-pair = new pair table
  //   // /ats = ats home
  //   // /ats/explore = ats explore page
  //   // /ats/create = ats create page
  //   // /ats/create = ats create page
  //   // /ats/[id] =  single ats page (enable/disable ats, delete ats, ats activity log)
  //   // /ats/[id]/edit = ats edit page
  //   // /earn = earn/referral page
  //   // /[chain]/tokens/[address] = token page

  //   console.log({ pathname });
  // }, [pathname, messages]);

  useEffect(() => {
    setShowAnalyzeButton(false);
    const pathnameSplit = pathname.split('/');
    const chains = ['solana', 'ethereum'];

    if (
      chains.includes(pathnameSplit[1].toLowerCase()) &&
      pathnameSplit[2] === 'tokens'
    ) {
      //enable analyze button
      setShowAnalyzeButton(true);
    }
  }, [pathname]);

  const handleAnalyzeToken = () => {
    handleSendMessage(`!analyze ${pathname.split('/')[3]}`);
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const handleSendMessage = async (message?: string) => {
    await getAccessToken();
    let messageToSend = '';

    if (message) {
      messageToSend = message;
    } else {
      messageToSend = messageInput;
    }

    if (messageToSend.trim().length <= 0 || isLoading) return;

    setIsLoading(true);
    setMessageInput('');
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: generateRandomId(),
        type: 'user',
        avatar: `${process.env.basePath}/images/brand/logo.svg`,
        name: 'User',
        content: messageToSend,
      },
    ]);

    try {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: generateRandomId(),
          type: 'ai',
          avatar: `${process.env.basePath}/images/brand/logo.svg`,
          name: 'Crush',
          content: '',
        },
      ]);

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: messageToSend,
          context: {
            pathname: pathname,
            plugin: selectedPlugin ? selectedPlugin.name : '-',
          },
        }),
      });

      if (!response.body) {
        throw new Error('Readable stream not supported!');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        aiMessage += decoder.decode(value);

        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          {
            ...prevMessages[prevMessages.length - 1],
            content: aiMessage,
          },
        ]);

        scrollToBottom();
      }

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const components = {
    code: (props: JSX.IntrinsicElements['code']) => {
      const { children } = props;
      const value = String(children).trim();

      if (value.startsWith('!')) {
        return (
          <button
            className=" font-semibold text-white hover:underline"
            onClick={() => setMessageInput(value)}
          >
            {value}
          </button>
        );
      }
      return <code>{children}</code>;
    },
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      {ready && authenticated ? (
        <div className="flex flex-col overflow-hidden h-full">
          <div
            className="flex flex-1 flex-col overflow-y-auto p-3 gap-4 overflow-x-hidden"
            ref={messagesContainerRef}
          >
            {messages.map((chat) => {
              return (
                <div key={chat.id} className="flex gap-3">
                  {/* <div className="w-8 h-8 min-w-8 min-h-8 overflow-hidden flex items-center justify-center bg-neutral-900 p-2 rounded-md">
                    {chat.type === 'ai' && (
                      <Image
                        src={`${chat.avatar}`}
                        alt={`${chat.name} avatar`}
                        width={100}
                        height={100}
                        className=""
                      />
                    )}
                    {chat.type === 'user' && (
                      <FaUser className=" text-primary text-sm" />
                    )}
                  </div> */}

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                      <div className="w-6 h-6 min-w-6 min-h-6 overflow-hidden flex items-center justify-center bg-neutral-900 p-[.3rem] rounded-md">
                        {chat.type === 'ai' && (
                          <Image
                            src={`${chat.avatar}`}
                            alt={`${chat.name} avatar`}
                            width={100}
                            height={100}
                            className=""
                          />
                        )}
                        {chat.type === 'user' && (
                          <FaUser className=" text-primary text-sm" />
                        )}
                      </div>
                      <div className="text-base font-semibold leading-4">
                        {chat.name}
                      </div>
                    </div>

                    {chat.content ? (
                      <ReactMarkdown
                        components={components}
                        className={`prose-sm prose-invert  break-words`}
                      >
                        {/* {cleanUpText(chat.content)} */}
                        {unescapeString(chat.content)}
                      </ReactMarkdown>
                    ) : (
                      <ChatLoading />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {showAnalyzeButton && (
            <div className=" p-3 flex flex-wrap gap-3  ">
              <button
                onClick={handleAnalyzeToken}
                type="button"
                className="border border-border text-xs bg-neutral-900 rounded-lg py-2 px-4"
              >
                Analyse Token
              </button>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="border-t border-border p-3 relative z-10 bg-neutral-950"
          >
            <div className="h-6 w-full relative ">
              <input
                onChange={(e) => setMessageInput(e.target.value)}
                value={messageInput}
                placeholder="Type a message..."
                className={`w-full h-full pr-9 bg-transparent text-neutral-text leading-6 outline-none ${
                  isMobile ? 'text-base' : ''
                }`}
              />
              <button
                onClick={() => {
                  handleSendMessage();
                }}
                className="w-7 h-7 right-0 rounded-md bg-neutral-900 absolute bottom-1/2 translate-y-1/2 flex items-center justify-center text-neutral-text-dark hover:bg-neutral-800 hover:text-neutral-text  apply-transition p-2"
              >
                {isLoading ? <Spinner /> : <FaPaperPlane />}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex flex-col overflow-hidden h-full relative">
          <div className="flex h-full gap-1 justify-center items-center text-center bg-black/50 absolute inset-0 backdrop-blur-sm z-50">
            <button
              type="button"
              onClick={handleSignIn}
              className=" underline "
            >
              Sign in
            </button>
            <span>{`to use AI Assistant`}</span>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto p-3 gap-4">
            {aiAssistantChatData.map((chat) => {
              return (
                <div key={chat.id} className="flex gap-3">
                  <div className="w-8 h-8 min-w-8 min-h-8 overflow-hidden flex items-center justify-center bg-neutral-900 p-2 rounded-md">
                    {chat.type === 'ai' && (
                      <Image
                        src={`${chat.avatar}`}
                        alt={`${chat.name} avatar`}
                        width={100}
                        height={100}
                        className=""
                      />
                    )}
                    {chat.type === 'user' && (
                      <FaUser className=" text-primary text-sm" />
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="text-base font-semibold leading-4">
                      {chat.name}
                    </div>
                    <div>{chat.content}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-border p-3 relative z-10 bg-neutral-950">
            <div className="h-6 w-full relative ">
              <input
                placeholder="Type a message..."
                className="w-full h-full pr-9 bg-transparent text-neutral-text leading-6 outline-none text-base md:text-sm"
              />
              <div className="w-7 h-7 right-0 rounded-md bg-neutral-900 absolute bottom-1/2 translate-y-1/2 flex items-center justify-center text-neutral-text-dark hover:bg-neutral-800 hover:text-neutral-text  apply-transition p-2">
                <FaPaperPlane />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistantForm;
