export type DBTable = {
  name: string;
  columns: {
    name: string;
    dataType: string;
    // User Defined Type Name
    udtName: string;
    isNullable: boolean;
    defaultValue: string;
    isUnique: boolean;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
    ordinalPosition: number;
    characterMaximumLength?: number;
  }[];
};
