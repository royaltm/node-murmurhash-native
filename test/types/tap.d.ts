/* a small restrictive subset declaration for tap */
declare module 'tap' {
  export interface Test {
    end(): void;
    error(error: Error, message?: string, extra?: any): void;
    ok(obj: any, message?: string, extra?: any): void;
    plan(count: number): void;
    strictEqual<T>(found: T, wanted: T, message?: string, extra?: any): void;
    test(label: string, f: (t: Test) => void): void;
    test(label: string, opt: Object, f: (t: Test) => PromiseLike<any>): void;
    test(label: string, opt: Object, f: (t: Test) => void): void;
    threw(error: any): any;
    type(object: any, type: string|Function, message?: string, extra?: any): void;
  }
  export function test(label: string, f: (t: Test) => void): void;
  export function test(label: string, opt: Object, f: (t: Test) => void): void;
  export function test(label: string, opt: Object, f: (t: Test) => PromiseLike<any>): void;
}
