//#region IMPORTS
import React, { FC, useEffect, useState } from 'react';
//#endregion

//#region MODULE TYPES/FUNCS
interface JsonFormEditorProps {
    defaultOpen?: boolean;
    data: any[];
}
interface IState {
    open: boolean;
    data: any[];
}
//#endregion

export const JsonFormEditor: FC<JsonFormEditorProps> = ({ defaultOpen, data }) => {
    const [state, setState] = useState<IState>({ open: false, data: [] });

    useEffect(() => {
        const resolvedData = data || [];
        setState({ open: defaultOpen ?? false, data: resolvedData })
    }, [data, setState, defaultOpen]);

    return <div>
        {JSON.stringify(state.data, undefined,5)}
    </div>
};
