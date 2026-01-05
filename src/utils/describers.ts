export type DescriptorKind =
  | 'aggregate'
  | 'repository'
  | 'mediator'
  | 'handler';

export type RelationKind =
  | 'depends_on'
  | 'implements'
  | 'uses'
  | 'publishes'
  | 'subscribes';

export interface SchemaFragment {
  nodes: Descriptor[];
  relations: Relation[];
}

export interface Schema {
  nodes: Map<string, Descriptor>;
  relations: Relation[];
}

export interface Describable {
  __descriptor__: Descriptor;
  __fragment__?: SchemaFragment;
}

export interface Relation {
  from: string;
  to: string;
  kind: RelationKind;
}

export interface Descriptor {
  /**
   * unique identifier for each described entity
   **/
  name: string;
  kind: DescriptorKind;
}

export const describedBy = (descriptor: Descriptor, relations: Relation[] = []): Describable => {
  if (!METADATA_ENABLED) return {} as Describable;
  return {
    __descriptor__: descriptor,
    __fragment__: { nodes: [descriptor], relations: relations },
  };
};

export const implementing = <A extends Describable>(implementee: A) =>
  <B>(selfName: string, implementer: B): B & A & Describable => ({
    ...implementee,
    ...implementer,
    ...METADATA_ENABLED && describedBy({
      ...implementee.__descriptor__,
      name: selfName,
    }, [{ kind: 'implements', from: implementee.__descriptor__.name, to: selfName }])
  });

const schemaFragments: SchemaFragment[] = [];

export const observe = <T extends Describable>(fn: (...args: any[]) => T) =>
  METADATA_ENABLED ? (...args: any[]) => {
    const value = fn(...args);
    if (typeof value === 'object' && value !== null && '__fragment__' in value) {
      schemaFragments.push(value.__fragment__);
    }
    return value;
  } : fn;

export const buildSchema = () => schemaFragments.reduce(
  (schema, fragment) => {
    fragment.nodes.forEach(d => {
      schema.nodes.set(d.name, d);
    });
    return {
      nodes: schema.nodes,
      relations: [...schema.relations, ...fragment.relations]
    };
  },
  { nodes: new Map(), relations: [] } as Schema,
);

