"use client";

import { useRouter } from "next/navigation";
import { updateCompany } from "@/lib/actions/companies";
import {
  CompanyForm,
  type CompanyFormValues,
} from "@/components/companies/company-form";

export function EditCompanyForm({
  id,
  defaultValues,
}: {
  id: string;
  defaultValues: CompanyFormValues;
}) {
  const router = useRouter();

  return (
    <CompanyForm
      defaultValues={defaultValues}
      submitLabel="Save changes"
      pendingLabel="Saving…"
      cancelHref={`/dashboard/companies/${id}`}
      action={async (formData) => {
        const result = await updateCompany(id, formData);
        if ("error" in result) return result;
        router.push(`/dashboard/companies/${id}`);
      }}
    />
  );
}
