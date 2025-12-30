export interface DataSource {
  save<E>(entity: E): Promise<void>;
  delete<E>(entity: E): Promise<void>;
  findById<PK, E>(identity: PK): Promise<E | E[]>;
}

export interface WriteRepository<E, PK> {
  save(entity: E): Promise<E>;
  saveAll(entities: E[]): Promise<PromiseSettledResult<Awaited<E>>[]>;
  delete(identity: E | PK): Promise<void>;
  update(identity: PK, entity: Partial<E>): Promise<E>;
}

export const writeRepository = <E, PK>(ds: DataSource): WriteRepository<E, PK> => ({
  delete: (identity) => ds.delete(identity),
  save: (entity) => ds.save(entity).then(() => entity),
  saveAll: (entities) => Promise.allSettled(entities.map(e => ds.save(e).then(() => e))),
  update: async (identity, entity) => {
    const entities = await ds.findById(identity);
    const current = Array.isArray(entities) ? entities[0] : entities;
    const data = { ...current, ...entity };
    await ds.save(data);
    return data;
  },
});

