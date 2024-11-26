// 'use server';

// import { z } from 'zod';
// import { sql } from '@vercel/postgres';
// import { revalidatePath } from 'next/cache';
// import { redirect } from 'next/navigation';
// // import { useRouter } from 'next/router';

// const FormSchema = z.object({
//     id: z.string(),
//     customerId: z.string(),
//     amount: z.coerce.number(),
//     status: z.enum(['pending', 'paid']),
//     date: z.string(),
// });

// const CreateInvoice = FormSchema.omit({ id: true, date: true});

// export async function createInvoice(formData: FormData) {

//     const { customerId, amount, status} = CreateInvoice.parse({
//         customerId: formData.get('customerId'),
//         amount: formData.get('amount'),
//         status: formData.get('status'),
//     });
//     const amountInCents = amount * 100;
//     const date = new Date().toISOString().split('T')[0];

//     try {
//         await sql`
//             INSERT INTO invoices (customer_id, amount, status, date)
//             VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
//         `;
//     } catch (_error) {
//         return {
//             message: 'Database Error: Failed to Create the Invoice.',
//         };
//     }

//     revalidatePath('/dashboard/invoices');
//     redirect('/dashboard/invoices');
//     // For testing
//     // console.log(formData);
// }


// const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// export async function updateInvoice(id: string, formData: FormData) {
//     const { customerId, amount, status } = UpdateInvoice.parse({
//         customerId: formData.get('customerId'),
//         amount: formData.get('amount'),
//         status: formData.get('status'),
//     });

//     const amountInCents = amount * 100;

//     try {
//         await sql`
//             UPDATE invoices
//             SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
//             WHERE id = ${id}
//         `;
//     } catch (_error) {
//         return { message: 'Database Error: Failed to Update the Invoice.'}
//     }

//     console.log('Redirecting to /dashboard/invoices');
//     revalidatePath('/dashboard/invoices');
//     redirect('/dashboard/invoices');
//     // const router = useRouter();
//     // router.push('/dashboard/invoices');
// }

// export async function deleteInvoice(id: string) {
//     // throw new Error('Failed to Delete Invoice');

//     try {
//         await sql`DELETE FROM invoices WHERE id = ${id}`;
//         revalidatePath('/dashboard/invoices');
//         return { message: 'Deleted Invoice Successfully.'}
//     } catch (_error) {
//         return { message: 'Database Error: Failed to Delete the Invoice.' }
//     }
// }
// 



// UPGRADED WITH CLAUDE AI: 
'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Base schema definition for invoices
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer',
        required_error: 'Client ID is required',
    }),
    amount: z.coerce.number({
        invalid_type_error: 'Amount must be a number',
        required_error: 'Amount is required',
    }).gt(0, 'Amount must be bigger than 0'),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status',
        required_error: 'Status is required',
    }),
    date: z.string(),
    });

    // Specific schemas to create and update
    const CreateInvoice = FormSchema.omit({ id: true, date: true });
    const UpdateInvoice = FormSchema.omit({ id: true, date: true });

    // Types for error answers
    type ActionResponse = {
    success: boolean;
    message: string;
    error?: unknown;
    };

    export type State = {
        errors?: {
            customerId?: string[],
            amount?: string[],
            status?: string[],
        };
        message?: string | null;
    }


    // FIRST FORM VALIDATION (CLIENT-SIDE)
    // export async function createInvoice(prevState: State, formData: FormData): Promise<ActionResponse> {
    // try {
    //     // Validating form data
    //     const validatedData = CreateInvoice.safeParse({
    //     customerId: formData.get('customerId'),
    //     amount: formData.get('amount'),
    //     status: formData.get('status'),
    //     });

    //     if (!validatedData.success) {
    //         return {
    //             errors: validatedData.error.flatten().fieldErrors,
    //             message: 'Missing fields. Failed to Create Invoice.'
    //         };
    //     }

    //     const amountInCents = validatedData.amount * 100;
    //     const date = new Date().toISOString().split('T')[0];

    //     await sql`
    //     INSERT INTO invoices (customer_id, amount, status, date)
    //     VALUES (${validatedData.customerId}, ${amountInCents}, ${validatedData.status}, ${date})
    //     `;

    //     // revalidatePath('/dashboard/invoices');
    //     // redirect('/dashboard/invoices');

    //     // return { success: true, message: 'Invoice created successfully' };
    // } catch (error) {
    //     console.error('Failed trying to create invoice: ', error);
    //     return {
    //     success: false,
    //     message: 'Failed trying to create invoice',
    //     error: error instanceof Error ? error.message : 'Unknown Error',
    //     };
    // }
    //     revalidatePath('/dashboard/invoices');
    //     redirect('/dashboard/invoices');
    // }


    // SECOND FORM VALIDATION (SERVER-SIDE)
    export async function createInvoice(prevState: State, formData: FormData) {
        // Validate form using Zod
        const validatedFields = CreateInvoice.safeParse({
            customerId: formData.get('customerId'),
            amount: formData.get('amount'),
            status: formData.get('status'),
            });
        
            // If form validation fails, return errors early. Otherwise, continue.
            if (!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
                message: 'Missing Fields. Failed to Create Invoice.',
            };
            }
        
            // Prepare data for insertion into the database
            const { customerId, amount, status } = validatedFields.data;
            const amountInCents = amount * 100;
            const date = new Date().toISOString().split('T')[0];
        
            // Insert data into the database
            try {
            await sql`
                INSERT INTO invoices (customer_id, amount, status, date)
                VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
            `;
            } catch (_error) {
            // If a database error occurs, return a more specific error.
            return {
                message: 'Database Error: Failed to Create Invoice.',
            };
            }
        
            // Revalidate the cache for the invoices page and redirect the user.
            revalidatePath('/dashboard/invoices');
            redirect('/dashboard/invoices');
        }

    // FIRST UPDATE FORM VALIDATION (CLIENT - SIDE)
    // export async function updateInvoice(id: string, formData: FormData): Promise<ActionResponse> {
    // try {
    //     const validatedData = UpdateInvoice.parse({
    //     customerId: formData.get('customerId'),
    //     amount: formData.get('amount'),
    //     status: formData.get('status'),
    //     });

    //     const amountInCents = validatedData.amount * 100;

    //     await sql`
    //     UPDATE invoices
    //     SET customer_id = ${validatedData.customerId}, 
    //         amount = ${amountInCents}, 
    //         status = ${validatedData.status}
    //     WHERE id = ${id}
    //     `;
        
    //     // revalidatePath('/dashboard/invoices');
    //     // redirect('/dashboard/invoices');
        
    //     // return { success: true, message: 'Invoice updated successfully' };
    // } catch (error) {
    //     console.error('Failed trying to update invoice: ', error);
    //     return {
    //     success: false,
    //     message: 'Failed trying to update invoice',
    //     error: error instanceof Error ? error.message : 'Unknown Error',
    //     };
    // }
    //     revalidatePath('/dashboard/invoices');
    //     redirect('/dashboard/invoices');
    // }


    export async function updateInvoice(
        id: string,
        prevState: State,
        formData: FormData,
        ) {
            const validatedFields = UpdateInvoice.safeParse({
            customerId: formData.get('customerId'),
            amount: formData.get('amount'),
            status: formData.get('status'),
            });
        
            if (!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
                message: 'Missing Fields. Failed to Update Invoice.',
            };
            }
        
            const { customerId, amount, status } = validatedFields.data;
            const amountInCents = amount * 100;
        
            try {
            await sql`
                UPDATE invoices
                SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
                WHERE id = ${id}
            `;
            } catch (error) {
            return { message: 'Database Error: Failed to Update Invoice.' };
            }
        
            revalidatePath('/dashboard/invoices');
            redirect('/dashboard/invoices');
        }


    export async function deleteInvoice(id: string): Promise<ActionResponse> {
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        return { 
        success: true, 
        message: 'Invoice deleted successfully' 
        };
    } catch (error) {
        console.error('Failed trying to delete the invoice: ', error);
        return {
        success: false,
        message: 'Failed trying to delete the invoice',
        error: error instanceof Error ? error.message : 'Unknown Error',
        };
    }
}