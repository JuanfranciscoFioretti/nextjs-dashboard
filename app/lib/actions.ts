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
        required_error: 'Client ID is required',
    }),
    amount: z.coerce.number({
        required_error: 'Amount is required',
        invalid_type_error: 'Amount must be a number',
    }).min(0, 'Amount must be bigger than 0'),
    status: z.enum(['pending', 'paid'], {
        required_error: 'Status is required',
        invalid_type_error: 'Invalid status',
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

    export async function createInvoice(formData: FormData): Promise<ActionResponse> {
    try {
        // Validating form data
        const validatedData = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
        });

        const amountInCents = validatedData.amount * 100;
        const date = new Date().toISOString().split('T')[0];

        await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${validatedData.customerId}, ${amountInCents}, ${validatedData.status}, ${date})
        `;

        // revalidatePath('/dashboard/invoices');
        // redirect('/dashboard/invoices');

        // return { success: true, message: 'Invoice created successfully' };
    } catch (error) {
        console.error('Failed trying to create invoice: ', error);
        return {
        success: false,
        message: 'Failed trying to create invoice',
        error: error instanceof Error ? error.message : 'Unknown Error',
        };
    }
        revalidatePath('/dashboard/invoices');
        redirect('/dashboard/invoices');
    }


    export async function updateInvoice(id: string, formData: FormData): Promise<ActionResponse> {
    try {
        const validatedData = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
        });

        const amountInCents = validatedData.amount * 100;

        await sql`
        UPDATE invoices
        SET customer_id = ${validatedData.customerId}, 
            amount = ${amountInCents}, 
            status = ${validatedData.status}
        WHERE id = ${id}
        `;
        
        // revalidatePath('/dashboard/invoices');
        // redirect('/dashboard/invoices');
        
        // return { success: true, message: 'Invoice updated successfully' };
    } catch (error) {
        console.error('Failed trying to update invoice: ', error);
        return {
        success: false,
        message: 'Failed trying to update invoice',
        error: error instanceof Error ? error.message : 'Unknown Error',
        };
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