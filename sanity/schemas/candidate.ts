import { defineField, defineType } from "sanity";

export const candidate = defineType({
  name: "candidate",
  title: "Candidate",
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
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      description: "One-line summary, e.g. 'Senior React engineer, fintech'",
    }),
    defineField({
      name: "avatarUrl",
      title: "Avatar URL",
      type: "url",
      description:
        "Profile photo (seeded demo data uses placeholder portraits)",
    }),
    defineField({
      name: "skills",
      title: "Skills",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "cvText",
      title: "CV / Profile",
      type: "text",
      rows: 20,
      description:
        "The candidate's full structured CV as text — searched semantically by the AI agent",
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      options: {
        list: ["referral", "linkedin", "job-board", "outreach", "other"],
      },
    }),
    defineField({
      name: "archived",
      title: "Archived",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "createdAt",
      title: "Added at",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "headline" },
  },
});
