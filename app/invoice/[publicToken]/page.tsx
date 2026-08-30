import { notFound } from "next/navigation";
import { GetPublicInvoice } from "@/lib/actions/invoice";
import InvoicePreview from "@/components/invoices/InvoicePreview";
import PrintInvoiceButton from "@/components/invoices/PrintInvoiceButton";

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ publicToken: string }>;
}) {
  const { publicToken } = await params;

  const invoice = await GetPublicInvoice(publicToken);
  if (!invoice) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl space-y-4 p-4 py-8 sm:py-12">
        <div className="flex justify-end print:hidden">
          <PrintInvoiceButton />
        </div>

        <InvoicePreview
          invoiceNumber={invoice.invoiceNumber}
          status={invoice.status}
          issueDate={invoice.issueDate}
          dueDate={invoice.dueDate}
          currency={invoice.currency}
          notes={invoice.notes}
          taxRate={invoice.taxRate}
          subtotal={invoice.subtotal}
          tax={invoice.tax}
          total={invoice.total}
          lineItems={invoice.lineItems}
          business={{ name: invoice.business.name, logoUrl: invoice.business.logo }}
          client={{ name: invoice.client.name, email: invoice.client.email, address: invoice.client.address }}
        />

        <p className="pt-4 text-center text-xs text-muted-foreground print:hidden">
          Powered by NexusForge
        </p>
      </div>
    </div>
  );
}
