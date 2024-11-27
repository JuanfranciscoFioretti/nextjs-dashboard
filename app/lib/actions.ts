'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

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


    // Form Validation (SERVER-SIDE)
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

    // Invoice updating
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

    // Invoice Deleting
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


export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                return 'Invalid credentials.';
            default:
                return 'Something went wrong.';
            }
        }
        throw error;
    }
}