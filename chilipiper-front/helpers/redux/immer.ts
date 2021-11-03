import produce, { Draft } from 'immer'
import { pickBy } from 'lodash'

interface MergeMapOfObjectsOptions {
    dontApplyUndefined?: boolean
    dontApplyEmptyArray?: boolean
}

const defaultMergeMapOfObjectsOptions: MergeMapOfObjectsOptions = {
    dontApplyUndefined: false,
    dontApplyEmptyArray: false,
}

export const mergeMapOfObjects = <T extends {}>(
    prev: Readonly<{ [key: string]: T }>,
    next: Readonly<{ [key: string]: Partial<T> }>,
    options: MergeMapOfObjectsOptions = defaultMergeMapOfObjectsOptions
): { [key: string]: T } =>
    produce(prev, result => {
        Object.keys(next).forEach(id => {
            if (!result[id]) {
                result[id] = next[id] as Draft<T>
            } else {
                const nextItem = options.dontApplyUndefined
                    ? pickBy(next[id], value =>
                          Array.isArray(value) ? value.length > 0 : value !== undefined
                      )
                    : next[id]

                result[id] = {
                    ...result[id],
                    ...nextItem,
                } as Draft<T>
            }
        })
    })

export const removeFromMapOfObjects = <T extends {}>(
    prev: Readonly<{ [key: string]: T }>,
    next: Readonly<{ [key: string]: Partial<T> }>
): { [key: string]: T } =>
    produce(prev, result => {
        Object.keys(next).forEach(key => {
            delete result[key]
        })
    })

export const removeFromObject = <T extends {}>(prev: T, key: keyof T): T =>
    produce(prev, result => {
        delete result[key as keyof Draft<T>]
    })
