import CustomersTable from "@/app/ui/customers/table";
import { fetchFilteredCustomers } from "@/app/lib/data";

import { FormattedCustomersTable } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";

import { Metadata } from "next";
import { formatCurrency } from "@/app/lib/utils";


export const metadata: Metadata = {
    title: 'Customers',
};

export default async function Customers(props: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
    }>;
}) {
    const searchParams = await props.searchParams || {};
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;


    const customersData = await fetchFilteredCustomers(query);
    console.log('fetchCustomers() : ', customersData );
    const customers: FormattedCustomersTable[] = customersData.map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email, // Email predeterminado (vacío)
        image_url: customer.image_url, // URL de imagen predeterminada (vacía)
        total_invoices: customer.total_invoices, // Valor predeterminado
        total_pending: formatCurrency(customer.total_pending), // Valor predeterminado
        total_paid: formatCurrency(customer.total_paid), // Valor predeterminado
    }));

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Customers</h1>
            </div>

            <div className="mt-4 flex items-center justify-between md:mt-8">
                <CustomersTable customers={customers}/>
            </div>
        </div>
    )
}
