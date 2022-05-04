import { Draft, Patch } from 'immer'

export type AnyObject = Record<string, unknown>
export type AnyArray = unknown[]

export type ComposeTask<Recipe, State, Args extends AnyArray = unknown[]> = (
    state: State,
    ...args: Args[]
) => Promise<Recipe | void> | Recipe | void

export type ComposeRecipe<State> = (draft: Draft<State>) => Draft<State> | void

// not following why produceWithPatches has a different return signature :/
export type ComposeWithPatchesRecipe<State> = (
    draft: Draft<State>
) => State | void

export declare const compose: <State, Args extends AnyArray = unknown[]>(
    ...tasks: ComposeTask<ComposeRecipe<State>, State, Args>[]
) => Promise<(state: State, ...args: Args[]) => Promise<State>>

export type Patches = Patch[]
export type InversePatches = Patch[]

export declare const composeWithPatches: <
    State,
    Args extends AnyArray = unknown[]
>(
    ...tasks: ComposeTask<ComposeWithPatchesRecipe<State>, State, Args>[]
) => Promise<
    (state: State, ...args: Args[]) => Promise<[State, Patches, InversePatches]>
>
