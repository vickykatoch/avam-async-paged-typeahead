export enum EntryType {
    Primitive='Primitive',
    Object ='Object',
    Array='Array',
    PrimitiveArray='PrimitiveArray'
}
export interface IJsonTreeNode {
    id: string;
    name: string;
    type: EntryType;
    value: string | IJsonTreeNode | Array<IJsonTreeNode> | Function;
    expanded?: boolean;
}
