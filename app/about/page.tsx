import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
// import Accordion from '@/components/Accordion';
// import Link from 'next/link';

const FaqPage = () => {
  return (
    <>
      <Head>
        <title>Crush - About</title>
      </Head>
      <div className="relative w-full rounded-lg border border-border overflow-hidden  flex-1 flex flex-col">
        <section className="relative z-20 flex flex-col items-center flex-1 w-full px-6 mx-auto py-24 overflow-y-auto">
          <div className="relative flex flex-col justify-center flex-1 w-full mx-auto text-neutral-200 max-w-2xl">
            <div className="pb-4 lg:pb-6 text-4xl font-montserrat font-bold">
              About Crush
            </div>
            <div className="flex flex-col gap-2">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Necessitatibus numquam iusto quod voluptatibus quaerat, saepe
                dolores earum placeat doloribus nemo fuga fugit officia commodi
                error voluptate. Quos voluptatum sint unde. Lorem ipsum dolor
                sit amet consectetur adipisicing elit. Aliquam, officiis nisi,
                quaerat alias eveniet ab dolor totam dolore porro quae
                accusamus, ad labore ullam numquam ipsa laborum consequatur.
                Aspernatur, modi.
              </p>
              <p>
                Crush AI leverages{' '}
                <Link
                  target="_blank"
                  href="https://www.tradingview.com/"
                  className="underline"
                >
                  TradingView
                </Link>{' '}
                technology for its market quotes, presenting them through
                sophisticated charts. This integration offers a broad spectrum
                of analytical tools for monitor cryptocurrency prices such as
                the{' '}
                <Link
                  target="_blank"
                  href="https://www.tradingview.com/symbols/ETHUSD/"
                  className="underline"
                >
                  price of ETHUSD
                </Link>{' '}
                and accessing the latest market insights
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default FaqPage;
