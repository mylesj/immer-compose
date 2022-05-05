import { Draft, Patch } from 'immer'

export type AnyObject = Record<string, unknown>
export type AnyArray = unknown[]

export type ComposeTask<State, Args extends AnyArray = unknown[]> = (
    initialState: State,
    ...args: Args[]
) => Promise<ThunkRecipe<State> | void> | ThunkRecipe<State> | void

export type ThunkRecipe<State> =
    | ThunkRecipeSync<State>
    | ThunkRecipeAsync<State>

export type ThunkRecipeSync<State> = (
    draft: Draft<State>
) => void | Draft<State>

export type ThunkRecipeAsync<State> = (
    draft: Draft<State>
) => Promise<Draft<State> | void>

export declare const compose: <State, Args extends AnyArray = unknown[]>(
    ...tasks: ComposeTask<State, Args>[]
) => Promise<(state: State, ...args: Args) => Promise<State>>

export declare const composeWithPatches: <
    State,
    Args extends AnyArray = unknown[]
>(
    ...tasks: ComposeTask<State, Args>[]
) => Promise<
    (state: State, ...args: Args) => Promise<[State, Patches, InversePatches]>
>

export type Patches = Patch[]
export type InversePatches = Patch[]
