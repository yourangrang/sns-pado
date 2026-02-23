import axios from "axios";
import { createContext, useContext, useEffect, useReducer } from "react";
import { User } from "../types";

interface State {
    authenticated: boolean;
    user: User | undefined;
    loading: boolean;
    imageUrl?: string;
}

const StateContext = createContext<State>({
    authenticated: false,
    user: undefined,
    loading: true,
    imageUrl: undefined,
});

const DispatchContext = createContext<any>(null);

interface Action {
    type: string;
    payload: any;
}


const reducer = (state: State, { type, payload }: Action) => {
    switch (type) {
        case "LOGIN":
            return {
                ...state,
                authenticated: true,
                user: payload,
                imageUrl: payload?.imageUrl,
            }
        case "LOGOUT":
            return {
                ...state,
                authenticated: false,
                user: null,
                imageUrl: undefined,
            }
        case "STOP_LOADING":
            return {
                ...state,
                loading: false
            }
        default:
            throw new Error(`Unknown action type: ${type}`)
    }
}



export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [state, defaultDispatch] = useReducer(reducer, {
        user: null,
        authenticated: false,
        loading: true,
        imageUrl: undefined,
    })

    const dispatch = (type: string, payload?: any) => {
        defaultDispatch({ type, payload });
    }

    useEffect(() => {
        async function loadUser() {
            try {
                const res = await axios.get("/auth/me");
                dispatch("LOGIN", res.data);
                console.log("context_data", res.data);
            } catch (error) {
                console.log(error)
            } finally {
                dispatch("STOP_LOADING");
            } // 성공 실패 상관없이 실행
        }
        loadUser();
    }, [])

    return (
        <DispatchContext.Provider value={dispatch}>
            <StateContext.Provider value={state}>{children}</StateContext.Provider>
        </DispatchContext.Provider>
    )
}

export const useAuthState = () => useContext(StateContext);
export const useAuthDispatch = () => useContext(DispatchContext);