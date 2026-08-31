import type { StructureResolver } from "sanity/structure";

import {
  CONTEXT_SCHEMA_TYPE_NAME,
  CONVERSATION_SCHEMA_TYPE_NAME,
} from "@sanity/context/studio";

import { icons } from "@sanity/icons";

const API_VERSION = "2026-08-01";

const DESK_TYPES = [
  { type: "company", title: "Client companies" },
  { type: "job", title: "Jobs" },
  { type: "candidate", title: "Candidates" },
  { type: "application", title: "Applications" },
  { type: "interview", title: "Interviews" },
] as const;

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Vetra")
    .items([
      S.listItem()
        .title("Agencies")
        .icon(icons.users)
        .child(
          S.documentTypeList("organization")
            .title("Agencies")
            .apiVersion(API_VERSION)
            .child((orgDocId) =>
              S.list()
                .title("Agency desk")
                .items(
                  DESK_TYPES.map(({ type, title }) =>
                    S.listItem()
                      .title(title)
                      .child(
                        S.documentList()
                          .title(title)
                          .schemaType(type)
                          .apiVersion(API_VERSION)
                          .filter(
                            `_type == $type && organization._ref == $orgDocId`,
                          )
                          .params({ type, orgDocId }),
                      ),
                  ),
                ),
            ),
        ),
      S.divider(),
      ...DESK_TYPES.map(({ type, title }) =>
        S.documentTypeListItem(type).title(`All ${title.toLowerCase()}`),
      ),
      S.documentTypeListItem("organization").title("All agencies"),
      S.divider(),
      S.listItem()
        .title("AI")
        .icon(icons.sparkles)
        .child(
          S.list()
            .title("AI")
            .items([
              S.documentTypeListItem(CONTEXT_SCHEMA_TYPE_NAME).title(
                "Agent context",
              ),
              S.documentTypeListItem(CONVERSATION_SCHEMA_TYPE_NAME).title(
                "Conversations",
              ),
            ]),
        ),
    ]);
