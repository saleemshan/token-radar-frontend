import type { Metadata } from 'next';
import { MdOutlineWifiOff } from 'react-icons/md';

export const metadata: Metadata = {
  title: 'Offline',
};

export default function Page() {
  return (
    <div className="fixed inset-0 z-[5000] bg-black flex-col p-3 items-center justify-center gap-3 flex ">
      <div className="flex flex-col gap-2  items-center justify-center max-w-sm">
        <MdOutlineWifiOff className=" text-[80px]" />
        <div className=" text-neutral-text-dark">Ooops, No Internet!</div>
        <div className="pb-6 text-neutral-text-dark">
          Please check your internet connection
        </div>
      </div>
    </div>
  );
}
