import { defineField, defineType } from "sanity";

export const company = defineType({
  name: "company",
  title: "Client Company",
  type: "document",
  fields: [
    defineField({
      name: "orgId",
      title: "Agency (Clerk org id)",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "organization",
      title: "Agency",
      type: "reference",
      to: [{ type: "organization" }],
      weak: true,
      description: "Synced from Clerk — orgId string remains the tenant key",
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "website", title: "Website", type: "url" }),
    defineField({ name: "industry", title: "Industry", type: "string" }),
    defineField({ name: "notes", title: "Notes", type: "text", rows: 4 }),
  ],
  preview: {
    select: { title: "name", subtitle: "industry" },
  },
});
