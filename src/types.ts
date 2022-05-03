import { Draft } from 'immer'

export { Draft } from 'immer'

export type AnyObject = Record<string, unknown>
export type AnyArray = unknown[]

export type ThunkRecipe<State> = (draft: Draft<State>) => Draft<State> | void
export type ComposeTask<State, Args extends AnyArray = unknown[]> = (
    state: State,
    ...args: Args[]
) => Promise<ThunkRecipe<State>> | ThunkRecipe<State> | void

export interface Compose {
    <State, Args extends AnyArray = unknown[]>(
        ...tasks: ComposeTask<State, Args>[]
    ): Promise<(state: State, ...args: Args) => Promise<State>>
}
