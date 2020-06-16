/*
Copyright 2019-present OmiseGO Pte Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { capitalize } from 'lodash';

import WrongNetworkModal from 'containers/modals/wrongnetwork/WrongNetworkModal';
import Button from 'components/button/Button';
import networkService from 'services/networkService';
import { selectModalState } from 'selectors/uiSelector';
import config from 'util/config';

import logo from 'images/omg_logo.svg';
import ethwallet from 'images/ethwallet.png';
import coinbase from 'images/coinbase.png';
import walletconnect from 'images/walletconnect.png';

import * as styles from './WalletPicker.module.scss';

function WalletPicker ({ onEnable }) {
  const [ walletMethod, setWalletMethod ] = useState(null);
  const [ walletEnabled, setWalletEnabled ] = useState(false);
  const [ accountsEnabled, setAccountsEnabled ] = useState(false);

  const wrongNetworkModalState = useSelector(selectModalState('wrongNetworkModal'));

  useEffect(() => {
    async function enableBrowserWallet () {
      const walletEnabled = await networkService.enableBrowserWallet();
      return walletEnabled
        ? setWalletEnabled(true)
        : setWalletMethod(null);
    }
    async function enableWalletConnect () {
      const walletEnabled = await networkService.enableWalletConnect();
      return walletEnabled
        ? setWalletEnabled(true)
        : setWalletMethod(null);
    }
    async function enableWalletLink () {
      const walletEnabled = await networkService.enableWalletLink();
      return walletEnabled
        ? setWalletEnabled(true)
        : setWalletMethod(null);
    }

    // clean storage of any references
    for (const _key in localStorage) {
      const key = _key.toLowerCase();
      if (key.includes('walletlink') || key.includes('walletconnect')) {
        localStorage.removeItem(_key);
      }
    }

    if (walletMethod === 'browser') {
      enableBrowserWallet();
    }
    if (walletMethod === 'walletconnect') {
      enableWalletConnect();
    }
    if (walletMethod === 'walletlink') {
      enableWalletLink();
    }
  }, [ walletMethod ]);

  useEffect(() => {
    async function initializeAccounts () {
      const initialized = await networkService.initializeAccounts();
      return initialized
        ? setAccountsEnabled(true)
        : setAccountsEnabled(false);
    }
    if (walletEnabled) {
      initializeAccounts();
      setWalletMethod(null);
    }
  }, [ walletEnabled ]);

  useEffect(() => {
    if (accountsEnabled) {
      onEnable(true);
    }
  }, [ onEnable, accountsEnabled ]);

  function getNetworkName () {
    if (config.network === 'main') {
      return 'Main Ethereum';
    }
    return `${capitalize(config.network)} Test`;
  }

  function resetSelection () {
    setWalletMethod(null);
    setWalletEnabled(false);
    setAccountsEnabled(false);
  }

  const browserEnabled = !!window.web3 || !!window.ethereum;
  const walletConnectEnabled = !!config.rpcProxy;
  const walletLinkEnabled = !!config.rpcProxy;

  return (
    <>
      <WrongNetworkModal open={wrongNetworkModalState || true} />

      <div className={styles.WalletPicker}>
        <div className={styles.title}>
          <img src={logo} alt='logo' />
          <div className={styles.menu}>
            <div>About</div>
            <div className={styles.network}>
              <div className={styles.indicator} />
              OMG Network:&nbsp;
              {config.network === 'main'
                ? 'Mainnet'
                : capitalize(config.network)
              }
            </div>
          </div>
        </div>

        <span className={styles.directive}>
          Select how you want to connect with the OMG Network.
        </span>
        <div className={styles.wallets}>
          <div
            className={[
              styles.wallet,
              !browserEnabled ? styles.disabled : ''
            ].join(' ')}
            onClick={() => setWalletMethod('browser')}
          >
            <img src={ethwallet} alt='ethwallet' />
            <h3>Browser Wallet</h3>
            {browserEnabled && (
              <div>
                Use a browser wallet extension such as Metamask or any built in browser wallet to connect with the OMG Network.
              </div>
            )}
            {!browserEnabled && (
              <div>Your browser does not have a web3 provider.</div>
            )}
          </div>
          <div
            className={[
              styles.wallet,
              !walletConnectEnabled ? styles.disabled : ''
            ].join(' ')}
            onClick={() => setWalletMethod('walletconnect')}
          >
            <img src={walletconnect} alt='walletconnect' />
            <h3>WalletConnect</h3>
            <div>Connect to the OMG Network with a WalletConnect-compatible wallet.</div>
          </div>
          <div
            className={[
              styles.wallet,
              !walletLinkEnabled ? styles.disabled : ''
            ].join(' ')}
            onClick={() => setWalletMethod('walletlink')}
          >
            <img src={coinbase} alt='coinbase' />
            <h3>WalletLink</h3>
            <div>Use the Coinbase wallet to connect with the OMG Network.</div>
          </div>
        </div>

        {walletEnabled && !accountsEnabled && (
          <div className={styles.loader}>
            <span>Your wallet is set to the wrong network.</span>
            <span>{`Please make sure your wallet is pointing to the ${getNetworkName()} Network.`}</span>

            <Button
              className={styles.button}
              onClick={resetSelection}
              type='secondary'
            >
              SELECT ANOTHER WALLET
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default React.memo(WalletPicker);
