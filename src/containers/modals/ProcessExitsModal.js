import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import numbro from 'numbro';

import { selectByzantine } from 'selectors/statusSelector';
import { selectLoading } from 'selectors/loadingSelector';
import { processExits } from 'actions/networkAction';

import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';
import Input from 'components/input/Input';

import * as styles from './ProcessExitsModal.module.scss';

function ProcessExitsModal ({ exitData, open, toggle }) {
  const dispatch = useDispatch();
  const byzantineChain = useSelector(selectByzantine);
  const loading = useSelector(selectLoading(['QUEUE/PROCESS']));
  const [ maxExits, setMaxExits ] = useState('');

  useEffect(() => {
    if (exitData) {
      setMaxExits(exitData.queuePosition);
    }
  }, [exitData]);

  async function submit () {
    if (maxExits > 0) {
      try {
        await dispatch(processExits(maxExits, exitData.currency));
        handleClose();
      } catch (err) {
        console.warn(err);
      }
    }
  }

  function handleClose () {
    setMaxExits('');
    toggle();
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <h2>Process Exit</h2>

      <div className={styles.note}>
        <span>This exit is currently</span>
        <span className={styles.position}>{exitData ? numbro(exitData.queuePosition).format({ output: 'ordinal' }) : ''}</span>
        <span>{`in the queue for this token. You will need to process ${exitData.queuePosition} ${exitData.queuePosition === 1 ? 'exit' : 'exits'} to release your funds.`}</span>
      </div>

      <Input
        label='How many exits would you like to process?'
        placeholder='20'
        type='number'
        value={maxExits}
        onChange={i => {
          i.target.value <= exitData.queueLength
            ? setMaxExits(i.target.value)
            : setMaxExits(exitData.queueLength)
        }}
      />

      <div className={styles.disclaimer}>
        {`Current exit queue length: ${exitData.queueLength || 0}`}
      </div>

      <div className={styles.buttons}>
        <Button
          onClick={handleClose}
          type='outline'
          style={{ flex: 0 }}
        >
          CANCEL
        </Button>
        <Button
          onClick={submit}
          type='primary'
          style={{ flex: 0 }}
          loading={loading}
          disabled={
            maxExits < 1 ||
            exitData.queueLength < 1 ||
            byzantineChain
          }
        >
          PROCESS
        </Button>
      </div>
    </Modal>
  );
}

export default ProcessExitsModal;
