import { getDatabaseClient } from '@/server/database/client';
import { RepositoryError } from '@/server/database/errors';

export type StorageMetric = {
  relationName: string;
  rowCount: number;
  tableBytes: number;
  indexBytes: number;
  totalBytes: number;
};

export type StorageSnapshot = {
  relations: StorageMetric[];
  totalBytes: number;
};

export async function getKiviStorageSnapshot(): Promise<StorageSnapshot> {
  const { data, error } = await getDatabaseClient().rpc('get_kivi_storage_metrics');
  if (error) throw new RepositoryError('read Kivi storage metrics', error.message);
  const relations = data.map((metric) => ({
    relationName: metric.relation_name,
    rowCount: Number(metric.row_count),
    tableBytes: Number(metric.table_bytes),
    indexBytes: Number(metric.index_bytes),
    totalBytes: Number(metric.total_bytes),
  }));
  return {
    relations,
    totalBytes: relations.reduce((total, metric) => total + metric.totalBytes, 0),
  };
}

export function diffStorageSnapshots(
  before: StorageSnapshot,
  after: StorageSnapshot,
): StorageSnapshot {
  const beforeByRelation = new Map(before.relations.map((metric) => [metric.relationName, metric]));
  const relations = after.relations.map((metric) => {
    const previous = beforeByRelation.get(metric.relationName);
    return {
      relationName: metric.relationName,
      rowCount: metric.rowCount - (previous?.rowCount ?? 0),
      tableBytes: metric.tableBytes - (previous?.tableBytes ?? 0),
      indexBytes: metric.indexBytes - (previous?.indexBytes ?? 0),
      totalBytes: metric.totalBytes - (previous?.totalBytes ?? 0),
    };
  });
  return { relations, totalBytes: after.totalBytes - before.totalBytes };
}
