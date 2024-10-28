export interface ConsulServiceObj {
    ID: string;
    Service: string;
    Tags: string[];
    Meta: any;
    Port: number;
    Address: string;
    Weights: {
        Passing: number;
        Warning: number;
    };
    EnableTagOverride: boolean;
    Datacenter: string;
}
export interface ConsulServiceMap {
    [key: string]: ConsulServiceObj;
}
export interface ConsulServiceNode {
    ID: string;
    Node: string;
    Address: string;
    Datacenter: string;
    TaggedAddresses: {
        lan: string;
        lan_ipv4: string;
        wan: string;
        wan_ipv4: string;
    };
    NodeMeta: Record<string, string>;
    ServiceKind: string;
    ServiceID: string;
    ServiceName: string;
    ServiceTags: string[];
    ServiceAddress: string;
    ServiceTaggedAddresses: {
        lan_ipv4: any;
        wan_ipv4: any;
    };
    ServiceWeights: {
        Passing: number;
        Warning: number;
    };
    ServiceMeta: any;
    ServicePort: number;
    ServiceSocketPath: string;
    ServiceEnableTagOverride: boolean;
    ServiceProxy: {
        Mode: string;
        MeshGateway: any;
        Expose: any;
    };
    ServiceConnect: any;
    ServiceLocality: null;
    CreateIndex: number;
    ModifyIndex: number;
}
export interface ConsulKV {
    LockIndex: number;
    Key: string;
    Flags: number;
    Value: string;
    CreateIndex: number;
    ModifyIndex: number;
}
