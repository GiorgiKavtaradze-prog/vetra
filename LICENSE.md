# MIT License

### Vetra — Multi-Tenant Recruitment CRM & AI Copilot

[![License: MIT](https://img.shields.io/badge/License-MIT-0064b7.svg)](./LICENSE.md)
[![Author](https://img.shields.io/badge/Author-GiorgiKavtaradze-181717?logo=github&logoColor=white)](https://github.com/GiorgiKavtaradze-prog)
[![Copyright](https://img.shields.io/badge/%C2%A9-2026-3178c6)](https://github.com/GiorgiKavtaradze-prog)
[![Next.js](https://img.shields.io/badge/Next.js-15.3+-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Sanity](https://img.shields.io/badge/Sanity-v3%2Fv6-f03e2f?logo=sanity&logoColor=white)](https://www.sanity.io/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth%20%26%20Billing-6C47FF?logo=clerk&logoColor=white)](https://clerk.com/)

---

## 1. Official License Text

```text
Copyright (c) 2026 GiorgiKavtaradze

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 2. Plain Language Summary

> _This summary provides a non-legally-binding overview of the MIT License terms above. The official text in Section 1 remains the sole legally binding agreement._

| ✅ You are free to                                                      | 📌 As long as you                                                                                 | ⚠️ Please note                                                                       |
| :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------- |
| **Commercial Use** — Use the software commercially or privately         | **Copyright Notice** — Retain the original copyright notice in all copies or substantial portions | **No Warranty** — The software is provided "as is" without any guarantee or warranty |
| **Modification** — Modify, adapt, or create derivative works            | **License Included** — Retain the full MIT license text in all distributions                      | **No Liability** — The author and contributors are not liable for claims or damages  |
| **Distribution** — Distribute original or modified versions             |                                                                                                   |                                                                                      |
| **Sublicensing** — Sublicense, sell, or package with closed-source code |                                                                                                   |                                                                                      |

---

## 3. Architecture & Operational Disclaimers

> The following operational notices clarify the technical and legal scope of the repository. They do **not** alter or restrict the core MIT License terms.

- **Educational Reference Implementation:** Vetra is engineered as a reference architecture showcasing multi-tenant integration of Next.js App Router, Sanity Context MCP, Clerk Authentication, and Clerk Billing. Prior to deploying in a high-stakes production environment, thoroughly audit organization scoping in [`lib/tenant.ts`](lib/tenant.ts) and MCP tools in [`lib/mcp.ts`](lib/mcp.ts).
- **Synthetic & Mock Datasets:** All agencies, candidates, client companies, CV attachments, interview debriefs, and compensation figures included in the default Sanity seed files are strictly synthetic demonstration data. Any resemblance to actual persons, living or deceased, or real commercial entities is purely coincidental.
- **Third-Party Trademarks:** Sanity.io, Clerk, Anthropic, Claude, Vercel, Next.js, React, Tailwind CSS, pnpm, and associated logos are registered trademarks of their respective copyright holders. References herein serve solely to describe technical stack components and do not imply official affiliation, sponsorship, or endorsement.
- **Secrets & Security:** Never check API keys, Clerk secret keys (`CLERK_SECRET_KEY`), Sanity write tokens (`SANITY_API_WRITE_TOKEN`), or Anthropic keys (`ANTHROPIC_API_KEY`) into source control. Always copy [`.env.example`](.env.example) to `.env.local` for local execution.
- **Sandbox Payments:** The included billing flows utilize Clerk Billing in sandbox / development mode. No real monetary transactions or credit card processing occur within the demonstration environment.

---

## 4. Attribution & Community Guidelines

If you use, fork, or build upon Vetra for open-source projects, articles, or presentations, attribution back to the project repository and to [GiorgiKavtaradze-prog](https://github.com/GiorgiKavtaradze-prog) is greatly appreciated.

### How to Attribute

When using Vetra as a reference or foundation, please include the following attribution:

```
This project is based on Vetra (https://github.com/GiorgiKavtaradze-prog/vetra),
licensed under the MIT License. Created by GiorgiKavtaradze-prog.
```

---

## 5. Third-Party Licenses

Vetra builds upon the following open-source projects, each with their own licenses:

| Project                                  | License        | Purpose                  |
| :--------------------------------------- | :------------- | :----------------------- |
| [Next.js](https://nextjs.org/)           | MIT            | React framework          |
| [React](https://react.dev/)              | MIT            | UI library               |
| [Sanity](https://www.sanity.io/)         | MIT/Commercial | Headless CMS             |
| [Clerk](https://clerk.com/)              | Commercial     | Authentication & Billing |
| [Tailwind CSS](https://tailwindcss.com/) | MIT            | Utility-first CSS        |
| [Vercel AI SDK](https://sdk.vercel.ai/)  | MIT            | AI model integration     |
| [Radix UI](https://www.radix-ui.com/)    | MIT            | Accessible primitives    |
| [Lucide](https://lucide.dev/)            | ISC            | Icon library             |
| [Motion](https://motion.dev/)            | MIT            | Animation library        |

All trademarks, service marks, and trade names referenced herein remain the property of their respective owners.

---

## 6. Contributing Guidelines

Contributions to Vetra are welcome! By submitting a pull request, you agree that:

1. Your contributions will be licensed under the same MIT License
2. You have the right to submit the code under these terms
3. Your contributions are original or properly licensed from the original source

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request with a clear description of changes

---

## 7. Contact & Support

- **GitHub Issues:** [github.com/GiorgiKavtaradze-prog/vetra/issues](https://github.com/GiorgiKavtaradze-prog/vetra/issues)
- **Author:** [GiorgiKavtaradze-prog](https://github.com/GiorgiKavtaradze-prog)
- **Repository:** [github.com/GiorgiKavtaradze-prog/vetra](https://github.com/GiorgiKavtaradze-prog/vetra)

---

**MIT © 2026 GiorgiKavtaradze** · _Part of the [Vetra](README.md) Ecosystem_
