import { useState } from 'react';
import { IAmpsConnectionInfo } from '../../common/amps';
import AmpsConnectionService from '../../common/amps/amps-connection-service';

const conInfo: IAmpsConnectionInfo = {
    name: 'DATA-FETCHER',
    url: ['ws://avam-ubnt:9028/amps/json']
};
const AmpsConnectionScratchPad: React.FC = () => {

    const onConnect = () => {
        const connector = AmpsConnectionService.getConnection(conInfo);
        connector.connecionStatus$.subscribe(status => {
            console.log(status);
        });
        setTimeout(() => {
            connector.dispose();
        }, 5000);
    }

    return <div className="d-flex flex-column flex-grow-1">
        <button onClick={onConnect}>Start</button>
    </div>
};
export default AmpsConnectionScratchPad;
