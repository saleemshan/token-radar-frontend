import React from 'react';
import Tooltip from './Tooltip';
import Image from 'next/image';
import {
  BULLX_ICON,
  CREATOR_ICON,
  DEVELOPER_ICON,
  GMGN_ICON,
  INSIDER_ICON,
  PEPEBOOST_ICON,
  PHOTON_ICON,
  RAT_TRADER_ICON,
  SMART_MONEY_ICON,
  SNIPER_ICON,
  TOP_HOLDER_ICON,
  TRANSFER_IN_ICON,
  TROJAN_ICON,
  WHALE_ICON,
} from '@/utils/label';

const IconLabel = ({ type }: { type: string }) => {
  switch (type.toLowerCase()) {
    case 'creator':
      return (
        <div className="relative group cursor-pointer">
          <Tooltip text="Creator">
            <Image src={CREATOR_ICON} alt="Creator" width={20} height={20} />
          </Tooltip>
        </div>
      );
      break;

    case 'top_holder':
      return (
        <div className="relative group cursor-pointer">
          <Tooltip text="Top Holder">
            <Image
              src={TOP_HOLDER_ICON}
              alt="Top Holder"
              width={20}
              height={20}
            />
          </Tooltip>
        </div>
      );
      break;

    case 'dev':
    case 'dev_team':
    case 'developer':
      return (
        <div className="relative group cursor-pointer">
          <Tooltip text="Developer">
            <Image
              src={DEVELOPER_ICON}
              alt="Developer"
              width={20}
              height={20}
            />
          </Tooltip>
        </div>
      );
      break;

    case 'sniper':
      return (
        <div className="relative group cursor-pointer">
          <Tooltip text="Sniper">
            <Image src={SNIPER_ICON} alt="Sniper" width={20} height={20} />
          </Tooltip>
        </div>
      );
      break;

    case 'insiders':
      return (
        <div className="relative group cursor-pointer">
          <Tooltip text="Insider">
            <Image src={INSIDER_ICON} alt="Insider" width={20} height={20} />
          </Tooltip>
        </div>
      );
      break;

    case 'smartmoney':
      return (
        <div className="relative group cursor-pointer">
          <Tooltip text="Smart Money">
            <Image
              src={SMART_MONEY_ICON}
              alt="Smart Money"
              width={20}
              height={20}
            />
          </Tooltip>
        </div>
      );
      break;

    case 'whale':
      return (
        <div className="relative group cursor-pointer">
          <Tooltip text="Whale">
            <Image src={WHALE_ICON} alt="Whale" width={20} height={20} />
          </Tooltip>
        </div>
      );
      break;

    case 'transfer_in':
      return (
        <div className="relative group cursor-pointer">
          <Tooltip text="Fishing Wallet">
            <Image
              src={TRANSFER_IN_ICON}
              alt="Fishing Wallet"
              width={20}
              height={20}
            />
          </Tooltip>
        </div>
      );
      break;

    case 'rat_trader':
      return (
        <div className="relative group cursor-pointer">
          <Tooltip text="Rat Trader">
            <Image
              src={RAT_TRADER_ICON}
              alt="Rat Trader"
              width={20}
              height={20}
            />
          </Tooltip>
        </div>
      );
      break;
    case 'gmgn':
      return (
        <div className="relative group cursor-pointer">
          <Tooltip text="GMGN">
            <Image src={GMGN_ICON} alt="GMGN" width={20} height={20} />
          </Tooltip>
        </div>
      );
      break;

    case 'bullx':
      return (
        <div className="relative group cursor-pointer">
          <Tooltip text="BULLX">
            <Image src={BULLX_ICON} alt="BULLX" width={20} height={20} />
          </Tooltip>
        </div>
      );
      break;

    case 'photon':
      return (
        <div className="relative group cursor-pointer">
          <Tooltip text="Photon">
            <Image src={PHOTON_ICON} alt="Photon" width={20} height={20} />
          </Tooltip>
        </div>
      );
      break;

    case 'pepeboost':
      return (
        <div className="relative group cursor-pointer">
          <Tooltip text="Pepeboost">
            <Image
              src={PEPEBOOST_ICON}
              alt="Pepeboost"
              width={20}
              height={20}
            />
          </Tooltip>
        </div>
      );
      break;

    case 'trojan':
      return (
        <div className="relative group cursor-pointer">
          <Tooltip text="Trojan">
            <Image src={TROJAN_ICON} alt="Trojan" width={20} height={20} />
          </Tooltip>
        </div>
      );
      break;

    default:
      return <></>;
  }
};

export default IconLabel;
