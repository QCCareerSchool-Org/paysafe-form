// type UniqueSpaceSeparatedHelper<T extends string, Remaining extends string> =
//   Remaining extends any
//     ? Remaining | `${Remaining} ${UniqueSpaceSeparated<T, Exclude<T, Remaining>>}`
//     : never;

// export type UniqueSpaceSeparated<T extends string, Pool extends string = T> =
//   [Pool] extends [never]
//     ? never
//     : UniqueSpaceSeparatedHelper<Pool, Pool>;

type UniqueSpaceSeparatedHelper<All extends string, Current extends string> =
  Current extends string
    ? Current | `${Current} ${UniqueSpaceSeparated<Exclude<All, Current>>}`
    : never;

export type UniqueSpaceSeparated<T extends string> =
  [T] extends [never]
    ? never
    : UniqueSpaceSeparatedHelper<T, T>;
