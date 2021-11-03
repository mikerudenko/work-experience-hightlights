import { createDefaultToast } from './Toast.factory';
import { HelperService } from '/services/HelperService';

export const ADD_TOAST = 'toast/show';
export const REMOVE_TOAST = 'toast/remove';

const initialState = {
    logger: [],
    list: [],
    active: {}
};

export function ToastsReducer(state = initialState, action) {
    const {data, type} = action;

    switch (type) {
        case ADD_TOAST:
            return {
                ...state,
                list: HelperService.uniqeArray([...state.list, data], 'text')
            };

        case REMOVE_TOAST:
            return {
                ...state,
                list: state.list.filter(toast => toast.id !== data),
                logger: [...state.logger, data]
            };

        default:
            return state;
    }
}

export function showToast(options) {
    return {
        type: ADD_TOAST,
        data: createDefaultToast(options)
    }
}

export function removeToast(id) {
    return {
        type: REMOVE_TOAST,
        data: id
    }
}
