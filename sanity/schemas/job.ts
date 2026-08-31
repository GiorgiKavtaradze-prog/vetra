import { defineField, defineType } from "sanity";

export const job = defineType({
  name: "job",
  title: "Job",
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
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 8,
    }),
    defineField({
      name: "seniority",
      title: "Seniority",
      type: "string",
      options: {
        list: ["junior", "mid", "senior", "staff", "lead", "executive"],
      },
    }),
    defineField({ name: "salaryRange", title: "Salary range", type: "string" }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: ["open", "closed"], layout: "radio" },
      initialValue: "open",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "company",
      title: "Client company",
      type: "reference",
      to: [{ type: "company" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "createdAt",
      title: "Created at",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "status", company: "company.name" },
    prepare({ title, subtitle, company }) {
      return {
        title,
        subtitle: [company, subtitle].filter(Boolean).join(" · "),
      };
    },
  },
});
