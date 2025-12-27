export interface DataSource {
  findBy<K extends PropertyKey, V, T>(key: K, value: V): Promise<T[]>;
  save<T>(entity: T): Promise<void>;
  delete<T>(entity: T): Promise<void>;
}

export interface Repository<T> {
}

export const repository = <T>(ds: DataSource): Repository<T> => ({
});

const dataSource: DataSource = {
  async findBy(_, __) { return []; },
  async delete(_) { },
  async save(_) { }
}

const userRepository = (ds: DataSource) => {
  const base = repository(ds);

  return {
    ...base,
    findByName(name: string) {
      return ds.findBy('name', name);
    }
  }
}

