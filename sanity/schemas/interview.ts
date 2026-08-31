import { defineField, defineType } from "sanity";

export const interview = defineType({
  name: "interview",
  title: "Interview",
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
      name: "application",
      title: "Application",
      type: "reference",
      to: [{ type: "application" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "roundName",
      title: "Round",
      type: "string",
      description: "e.g. 'Recruiter screen', 'Technical interview', 'Final'",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "scheduledAt",
      title: "Scheduled at",
      type: "datetime",
    }),
    defineField({ name: "interviewer", title: "Interviewer", type: "string" }),
    defineField({
      name: "feedbackText",
      title: "Feedback / debrief",
      type: "text",
      rows: 10,
      description:
        "The interviewer's written debrief — searched semantically by the AI agent",
    }),
    defineField({
      name: "outcome",
      title: "Outcome",
      type: "string",
      options: { list: ["pending", "pass", "fail"], layout: "radio" },
      initialValue: "pending",
    }),
  ],
  preview: {
    select: { title: "roundName", subtitle: "outcome" },
  },
});
