import React, { Component } from 'react';
import { Child } from './child';
import { Parent } from './parent';


interface JsonTreeProps {
    data: any[];
    readonly?: boolean;
    parentComponent?: React.FC,
    childComponent?: React.FC,
    noLeftMargin?: boolean;
    isDefaultOpen?: boolean;
    onChildClick:(data:any)=> void;
}
interface IState {
    open: boolean;
    data : any[];
}

class JsonTree extends Component<JsonTreeProps, IState>{
    constructor(props: JsonTreeProps) {
        super(props);
        this.state = {
            open: false,
            data: props.data
        };
    }

    getTree(data: Array<any>) {
        if (data && data.length) {
            return this.getParentsAndChild(data)
        }
        return <p></p>

    }
    getParentsAndChild(data: Array<any>) {
        return data.map(d => {
            if (d.child && d.child.length) {
                return (
                    <div className={this.props.noLeftMargin ? '' : 'tml15'}>
                        <Parent {...this.props} data={d} parentComponent={this.props.parentComponent} />
                    </div>
                )
            } else {
                return (
                    <div className={this.props.noLeftMargin ? '' : 'tml15'}>
                        <Child onChildClick={this.props.onChildClick} data={d} CustomChild={this.props.childComponent} />
                    </div>
                )
            }
        });
    }

    render() {
        return this.getTree(this.state.data);
    }
}
export default JsonTree;

{/* <div className="">
{this.getTree(this.state.data)}
</div> */}
// export const JsonTree: FC<JsonTreeProps> = ({value,readonly})=> {
//     return (<h1>JSON Tree Editor</h1>);
// };
