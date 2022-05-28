import { EntryType, IJsonTreeNode } from './models';
import { v4 as uuidv4 } from 'uuid';

const isObject = (value: any): boolean => !!value && value.constructor === Object;
const isObjectArray = (value: any[]): boolean => value.every(isObject);
const convert = (item: any): Array<IJsonTreeNode> => {
    const x = Object.entries(item).map(([key, val]: any) => {
        let value: any;
        let type = EntryType.Primitive;
        if (Array.isArray(val)) {
            if (isObjectArray(val)) {
                type =EntryType.Array;
                value = val.map((i,idx) => ({
                    id: uuidv4(),
                    name: idx,
                    value: convert(i),
                    type:EntryType.Object,
                    expanded: true,
                }));
            } else {
                type =EntryType.PrimitiveArray;
                value =val;
            }           
        } else if (isObject(val)) {
            value = convert(val);
            type = EntryType.Object;
        } else {
            value = val;
        }
        return {
            id: uuidv4(),
            name: key,
            value,
            type,
            expanded: true,
        };
    });
    return x;
};

export function fromJson(jsonArray: Array<any>): Array<IJsonTreeNode> {
    return jsonArray.map((item) => ({
        id: uuidv4(),
        name: '{}',
        value: convert(item),
        type: EntryType.Object,
        expanded: true,
    }));
}
export function toJson(data: any[]): Array<IJsonTreeNode> {
    return [];
}
