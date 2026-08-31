import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { STAGES } from "@/sanity/schemas/stages";
import { createCompany } from "@/lib/actions/companies";
import { createJob, closeJob, reopenJob } from "@/lib/actions/jobs";
import { createCandidate, archiveCandidate } from "@/lib/actions/candidates";
import { createApplication, moveApplication } from "@/lib/actions/applications";
import { createInterview } from "@/lib/actions/interviews";

const SENIORITIES = [
  "junior",
  "mid",
  "senior",
  "staff",
  "lead",
  "executive",
] as const;
const SOURCES = [
  "referral",
  "linkedin",
  "job-board",
  "outreach",
  "other",
] as const;
const OUTCOMES = ["pending", "pass", "fail"] as const;

function toFormData(fields: Record<string, string | undefined>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) fd.set(key, value);
  }
  return fd;
}

export function buildActionTools() {
  return {
    create_company: tool({
      description:
        "Add a new client company to this agency's workspace. Use only when the user explicitly asks to add a company.",
      inputSchema: z.object({
        name: z.string().min(1),
        website: z.string().optional(),
        industry: z.string().optional(),
        notes: z.string().optional(),
      }),
      execute: async (input) => {
        try {
          await createCompany(toFormData(input));
          return { ok: true, message: `Company "${input.name}" created.` };
        } catch (e) {
          return {
            error:
              e instanceof Error ? e.message : "Could not create the company.",
          };
        }
      },
    }),

    create_job: tool({
      description:
        "Open a new job at one of the agency's client companies. Requires a real company _id — look it up with groq_query first. Free-plan job caps apply.",
      inputSchema: z.object({
        title: z.string().min(1),
        companyId: z
          .string()
          .min(1)
          .describe("The _id of an existing company document"),
        description: z.string().optional(),
        seniority: z.enum(SENIORITIES).optional(),
        salaryRange: z.string().optional(),
      }),
      execute: async (input) => {
        const result = await createJob(toFormData(input));
        return "error" in result
          ? result
          : { ok: true, message: `Job "${input.title}" opened.` };
      },
    }),

    set_job_status: tool({
      description:
        "Close a job or reopen a closed one. Use only on explicit user instruction. Requires the job's real _id.",
      inputSchema: z.object({
        jobId: z.string().min(1),
        status: z.enum(["open", "closed"]),
      }),
      execute: async ({ jobId, status }) => {
        try {
          if (status === "closed") await closeJob(jobId);
          else await reopenJob(jobId);
          return { ok: true, message: `Job is now ${status}.` };
        } catch {
          return { error: "That job is not in this workspace." };
        }
      },
    }),

    create_candidate: tool({
      description:
        "Add a candidate to the agency's talent pool. Use only when the user explicitly asks to add someone. Free-plan candidate caps apply.",
      inputSchema: z.object({
        name: z.string().min(1),
        email: z.string().optional(),
        headline: z.string().optional(),
        skills: z.array(z.string()).optional(),
        cvText: z
          .string()
          .optional()
          .describe("Full CV / profile text if the user provides it"),
        source: z.enum(SOURCES).optional(),
      }),
      execute: async (input) => {
        const result = await createCandidate(input);
        return result.error
          ? result
          : {
              ok: true,
              candidateId: result.id,
              message: `Candidate "${input.name}" added ([${input.name}](/dashboard/candidates/${result.id})).`,
            };
      },
    }),

    archive_candidate: tool({
      description:
        "Archive a candidate (soft-hide from the active pool; never deletes). Use only on explicit user instruction, and restate who you are archiving.",
      inputSchema: z.object({
        candidateId: z.string().min(1),
      }),
      execute: async ({ candidateId }) => {
        try {
          await archiveCandidate(candidateId);
          return { ok: true, message: "Candidate archived." };
        } catch {
          return { error: "That candidate is not in this workspace." };
        }
      },
    }),

    add_to_pipeline: tool({
      description:
        "Create an application: put an existing candidate into an existing job's pipeline at the 'applied' stage. Requires real _ids for both — look them up first.",
      inputSchema: z.object({
        jobId: z.string().min(1),
        candidateId: z.string().min(1),
      }),
      execute: async ({ jobId, candidateId }) => {
        const result = await createApplication(jobId, candidateId);
        return "error" in result
          ? result
          : {
              ok: true,
              message: "Candidate added to the pipeline at 'applied'.",
            };
      },
    }),

    move_application: tool({
      description:
        "Move an application to a different pipeline stage (applied, screening, interviewing, offer, hired, rejected). Use only on explicit user instruction — especially for 'rejected'. Requires the application's real _id.",
      inputSchema: z.object({
        applicationId: z.string().min(1),
        stage: z.enum(STAGES),
      }),
      execute: async ({ applicationId, stage }) => {
        const result = await moveApplication(applicationId, stage);
        return "error" in result
          ? result
          : { ok: true, message: `Moved to ${result.stage}.`, ...result };
      },
    }),

    log_interview: tool({
      description:
        "Log an interview round (with optional written feedback and outcome) against a candidate's application. Requires real _ids for the candidate and the application.",
      inputSchema: z.object({
        candidateId: z.string().min(1),
        applicationId: z.string().min(1),
        roundName: z.string().min(1),
        scheduledAt: z.string().optional().describe("ISO datetime"),
        interviewer: z.string().optional(),
        feedbackText: z.string().optional(),
        outcome: z.enum(OUTCOMES).optional(),
      }),
      execute: async (input) => {
        const result = await createInterview(input);
        return result.error
          ? result
          : { ok: true, interviewId: result.id, message: "Interview logged." };
      },
    }),
  };
}

export function buildClientTools() {
  return {
    get_current_page: tool({
      description:
        "Find out which dashboard page the user is currently looking at (and which job or candidate it shows). Call this when the user says 'this job', 'here', 'this candidate', or asks about the current page.",
      inputSchema: z.object({}),
    }),
    navigate_to: tool({
      description:
        "Navigate the user's browser to a dashboard page, e.g. after citing a candidate the user wants to open. Only /dashboard paths are allowed.",
      inputSchema: z.object({
        path: z
          .string()
          .min(1)
          .describe("A /dashboard/... path, e.g. /dashboard/candidates/<_id>"),
      }),
    }),
  };
}
