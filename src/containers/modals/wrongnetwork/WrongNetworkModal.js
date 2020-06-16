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

import React from 'react';
import { useDispatch } from 'react-redux';

import { closeModal } from 'actions/uiAction';

import Modal from 'components/modal/Modal';

import * as styles from './WrongNetworkModal.module.scss';

function WrongNetworkModal ({ open }) {
  const dispatch = useDispatch();

  function handleClose () {
    dispatch(closeModal('wrongNetworkModal'));
  }

  const network = 'todo';

  return (
    <Modal open={open} onClose={handleClose}>
      <h2>Wrong Network</h2>
      <div>Please switch your wallet to the {network} in order to continue.</div>
    </Modal>
  );
}

export default React.memo(WrongNetworkModal);
