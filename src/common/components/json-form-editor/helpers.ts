import { EntryType, IJsonTreeNode } from './models';
import { v4 as uuidv4 } from 'uuid';

const isObject = (value: any): boolean => !!value && value.constructor === Object;
const isObjectArray = (value: any[]): boolean => value.every(isObject);
const encode = (item: any): Array<IJsonTreeNode> => {
    const x = Object.entries(item).map(([key, val]: any) => {
        let value: any;
        let type = EntryType.Primitive;
        if (Array.isArray(val)) {
            if (isObjectArray(val)) {
                type =EntryType.Array;
                value = val.map((i,idx) => ({
                    id: uuidv4(),
                    name: idx,
                    value: encode(i),
                    type:EntryType.Object,
                    expanded: false,
                }));
            } else {
                type =EntryType.PrimitiveArray;
                value =val;
            }           
        } else if (isObject(val)) {
            value = encode(val);
            type = EntryType.Object;
        } else {
            value = val;
        }
        return {
            id: uuidv4(),
            name: key,
            value,
            type,
            expanded: false,
        };
    });
    return x;
};
const decode =(node: IJsonTreeNode) : any=> {
    return (node.value as Array<IJsonTreeNode>).reduce((acc,n)=> {
         if(n.type===EntryType.Primitive || n.type===EntryType.PrimitiveArray) {
             acc[n.name]= n.value;
         } else if(n.type===EntryType.Object) {
             acc[n.name] = decode(n);
         } else {
             acc[n.name] = (n.value as Array<IJsonTreeNode>).map(dn=>decode(dn));
         }
         return acc;
     },{} as Record<string, any>);
 };

export function fromJson(jsonArray: Array<any>): Array<IJsonTreeNode> {
    return jsonArray.map((item) => ({
        id: uuidv4(),
        name: '{}',
        value: encode(item),
        type: EntryType.Object,
        expanded: true,
    }));
}
export function toJson(nodes: Array<IJsonTreeNode>): Array<any> {
    return nodes.map(node=>decode(node));
}

export function createNode(type: EntryType) : IJsonTreeNode {
    return {
        id: uuidv4(),
        name:'',
        value: '',
        type:EntryType.Primitive
    }
}