// import { useState } from 'react';

// // Definimos los tipos necesarios
// type ActionFn<S, F> = (prevState: S, formData: F) => Promise<Partial<S>>; // Acción que actualiza el estado
// type UseActionState<S, F> = [S, (formData: F) => Promise<void>]; // Resultado del hook

// export function useActionState<S, F>(action: ActionFn<S, F>, initialState: S): UseActionState<S, F> {
//   const [state, setState] = useState<S>(initialState); // Estado inicial tipado

//   const formAction = async (formData: F) => {
//     try {
//       const newState = await action(state, formData); // Ejecutamos la acción
//       setState((prev) => ({ ...prev, ...newState })); // Actualizamos el estado
//     } catch (error) {
//       console.error(error); // Manejamos errores
//       setState((prev) => ({
//         ...prev,
//         message: 'An unexpected error occurred.',
//       }));
//     }
//   };

//   return [state, formAction];
// }




// import { useState } from 'react';

// export function useActionState(action: Function, initialState: any) {
//     const [state, setState] = useState(initialState);

//     const formAction = async (formData: FormData) => {
//         try {
//         const newState = await action(state, formData);
//         setState((prev: any) => ({ ...prev, ...newState }));
//         } catch (error) {
//         console.error(error);
//         setState((prev: any) => ({
//             ...prev,
//             message: 'An unexpected error occurred.',
//         }));
//         }
//     };

//     return [state, formAction];
// }
