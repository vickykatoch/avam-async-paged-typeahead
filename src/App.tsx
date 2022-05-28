import React from 'react';
import './App.scss';
import { JsonFormEditor } from './common/components/json-object-editor';
import { JsonTree } from './common/components/jtree-editor';
import { AmpsConnectionScratchPad } from './domain/scratch-pad';
import jsonData from './common/components/json-object-editor/file.json';

const data = [
    {
        "id": 1,
        "name": "Parent 1",
        "child": [
            {
                "id": 1,
                "name": "Parent 1.1",
                "child": [
                    {
                        "id": 2,
                        "name": "Child 1"
                    }
                ]
            },
            {
                "id": 2,
                "name": "Parent 1.2",
                "description": "",
                "value": "",
                "child": [
                    {
                        "id": 3,
                        "name": "Chid 2"
                    },
                    {
                        "id": 4,
                        "name": "Chid 3"
                    },
                    {
                        "id": 5,
                        "name": "Chid 4"
                    }
                ]
            }
        ]
    },
    {
        "id": 6,
        "name": "Parent 2",
        "child": [{
            "id": 1,
            "name": "Parent 1",
            "child": [
                {
                    "id": 1,
                    "name": "Parent 1.1",
                    "child": [
                        {
                            "id": 2,
                            "name": "Child 1"
                        }
                    ]
                },
                {
                    "id": 2,
                    "name": "Parent 1.2",
                    "description": "",
                    "value": "",
                    "child": [
                        {
                            "id": 3,
                            "name": "Chid 2"
                        },
                        {
                            "id": 4,
                            "name": "Chid 3"
                        },
                        {
                            "id": 5,
                            "name": "Chid 4"
                        }
                    ]
                }
            ]
        }]
    }
];

function App() {

    return (
        <div className="d-flex flex-grow-1" style={{ marginTop: 50 }}>
            {/* <AmpsConnectionScratchPad /> */}
            <div className='d-flex flex-column flex-grow-1 flex-shrink-0'>
                <JsonTree
                    data={data}
                    onChildClick={(child) => console.log(child)}
                    isDefaultOpen={false}
                    noLeftMargin={false} />
            </div>
            <div className='d-flex flex-grow-1 flex-shrink-0'>
                <JsonFormEditor data={jsonData}/>
            </div>
        </div>
    );
}

export default App;
