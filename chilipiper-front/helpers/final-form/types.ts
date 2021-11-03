import { FieldRenderProps, RenderableProps, UseFieldConfig } from 'react-final-form'

export const getFieldAdapterError = (meta: FieldRenderProps<any, any>['meta']) =>
    meta.touched && !meta.active ? meta.error : ''

interface FinalFieldInjectedProps {
    value?: any
    onChange?: Function
    onFocus?: Function
    onBlur?: Function
    error?: string
}

export type UncontrolledFieldProps<FieldProps extends FinalFieldInjectedProps> = Omit<
    FieldProps,
    keyof FinalFieldInjectedProps
>

export type FinalFieldValidator<T> = (value?: T) => string | undefined

/** Strict version of the same type from react-final-form (without `[otherProp: string]: any;`) */
export interface FieldProps<FieldValue, T extends HTMLElement>
    extends UseFieldConfig<FieldValue>,
        RenderableProps<FieldRenderProps<FieldValue, T>> {
    name: string
}
