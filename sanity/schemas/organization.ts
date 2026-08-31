import { defineField, defineType } from "sanity";

export const organization = defineType({
  name: "organization",
  title: "Agency",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "clerkOrgId",
      title: "Clerk org id",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "imageUrl", title: "Logo URL", type: "url" }),
    defineField({ name: "createdAt", title: "Created at", type: "datetime" }),
    defineField({
      name: "deletedAt",
      title: "Deleted at (Clerk)",
      type: "datetime",
      description:
        "Set when Clerk reports the organization deleted — documents are kept",
    }),
    defineField({ name: "syncedAt", title: "Last synced", type: "datetime" }),
  ],
  preview: {
    select: { title: "name", subtitle: "clerkOrgId" },
  },
});
