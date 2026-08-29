declare module 'sql.js' {
  export interface Database {
    run(sql: string, params?: any[]): Database;
    exec(sql: string): Database;
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
  }

  export interface Statement {
    bind(params?: any[]): Statement;
    step(): boolean;
    getAsObject(): Record<string, any>;
    free(): boolean;
  }

  export interface SqlJsStatic {
    Database: new (source?: ArrayLike<number>) => Database;
  }

  export default function initSqlJs(config?: any): Promise<SqlJsStatic>;
}
